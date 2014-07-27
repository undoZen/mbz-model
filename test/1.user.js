var assert = require('assert');
var Q = require('q');
var supertest = require('supertest');

var _ = require('lodash');

var crypt = require('../lib/crypt');
var app = require('../');

describe('user model', function () {

  var userObj = {
    username: 'undozen',
    password: '123123123',
    email: 'undozen@gmail.com'
  };

  it('can save user and not save password in plain', function (done) {
    supertest(app)
      .post('/user')
      .type('json')
      .send(userObj)
      .expect(201, function (err, res) {
        assert.ok(!err);
        assert.equal(res.body.id, 1);
        userObj.id = res.body.id;
        assert.equal(res.body.username, userObj.username);
        assert.equal(res.body.email, userObj.email);
        assert.notEqual(res.body.password, userObj.password);
        done();
      });
  });

  it('can get user by id and check password', function (done) {
    supertest(app)
      .get('/user/1')
      .expect(200, function (err, res) {
        assert.ok(!err);
        assert(crypt.vhash(userObj.password, res.body.password));
        delete userObj.password;
        var user = res.body;
        delete user.password;
        delete user.createdAt;
        delete user.updatedAt;
        assert.deepEqual(user, userObj);
        done();
      });
  });

  function getBy(prop, value, done, conti) {
    supertest(app)
      .get('/user?'+prop+'='+value)
      .expect(200, function (err, res) {
        assert.ok(!err);
        var user = res.body;
        delete user.password;
        delete user.createdAt;
        delete user.updatedAt;
        assert.deepEqual(user, userObj);
        if (conti) done(user);
        else done();
      });
  }

  it('can get user by username', function (done) {
    getBy('username', userObj.username, done);
  });

  it('can get user by email', function (done) {
    getBy('email', userObj.email, done);
  });

  function testConflict(uo, prop, done) {
    supertest(app)
      .post('/user')
      .type('json')
      .send(uo)
      .expect(400, function (err, res) {
        assert.ok(!err);
        assert.equal(res.body.error_message, prop + ' already exists');
        done();
      });
  }

  it('will throw error when username conflict', function (done) {
    var uo = _.extend({}, userObj);
    delete uo.id;
    testConflict(uo, 'username', done);
  });

  it('will throw error when email conflict', function (done) {
    var uo = _.extend({}, userObj, {username:'helloworld'});
    delete uo.id;
    testConflict(uo, 'email', done);
  });

  it('username should be case-insensitive', function (done) {
    var uo = _.extend({}, userObj, {username:'undoZen'});
    delete uo.id;
    getBy('username', uo.username, function (user) {
      testConflict(uo, 'username', done);
    }, true);
  });

  it('email should be case-insensitive', function (done) {
    var uo = _.extend({}, userObj, {username: 'helloworld', email: 'undoZen@GMail.com'});
    delete uo.id;
    getBy('email', uo.email, function (user) {
      testConflict(uo, 'email', done);
    }, true);
  });

});
