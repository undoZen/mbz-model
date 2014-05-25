var assert = require('assert');
var Q = require('q');
var _ = require('lodash');

var spawn = require('child_process').spawn;

var crypt = require('../utils').crypt;
var userModel = require('../models/user');

describe('user model', function () {
  var child;
  before(function (done) {
    //dump.rdb file will be deleted by last test case.
    child = spawn('redis-server', [__dirname + '/redis.conf']);
    var doneCalled = false;
    child.stdout.on('data', function () {
      if (doneCalled) return;
      doneCalled = true;
      done();
    });
  });

  after(function (done) {
    child.kill();
    child.on('close', function () {
      done();
    });
  });

  var userObj = {
    username: 'undozen',
    password: '123123123',
    email: 'undozen@gmail.com'
  };

  it('can save user', function (done) {
    userModel.qAddUser(userObj)
    .then(function (id) {
      assert.equal(id, 1);
      done();
    }).done();
  });
  
  it('not save password in plain', function (done) {
    userModel.qGetUserById(1)
    .then(function (user) {
      assert.notEqual(user.password, userObj.password);
      done();
    }).done();
  });

  it('could check password use utils.crypt.vhash', function (done) {
    userModel.qGetUserById(1)
    .then(function (user) {
      assert(crypt.vhash(userObj.password, user.password));
      delete userObj.password;
      userObj.id = 1;
      done();
    }).done();
  });

  it('can get user by id', function (done) {
    userModel.qGetUserById(1)
    .then(function (user) {
      delete user.password;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('can get user by username', function (done) {
    userModel.qGetUserByUsername(userObj.username)
    .then(function (user) {
      delete user.password;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('can get user by email', function (done) {
    userModel.qGetUserByEmail(userObj.email)
    .then(function (user) {
      delete user.password;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('will throw error when email conflict', function (done) {
    var uo = _.extend({}, userObj, {username:'helloworld'});
    userModel.qAddUser(uo)
    .fail(function (err) {
      assert.equal(err.message, 'email exists');
      done();
    }).done();
  });

  it('will throw error when username conflict', function (done) {
    userModel.qAddUser(userObj)
    .fail(function (err) {
      assert.equal(err.message, 'username exists');
      done();
    }).done();
  });

  it('username should be case-insensitive', function (done) {
    var uo = _.extend({}, userObj, {username:'undoZen'});
    userModel.qGetUserByUsername(uo.username)
    .then(function (user) {
      delete user.password;
      assert.deepEqual(user, userObj);
      return userModel.qAddUser(uo);
    })
    .fail(function (err) {
      assert.equal(err.message, 'username exists');
      done();
    }).done();
  });

  it('email should be case-insensitive', function (done) {
    var uo = {
      username: 'helloworld',
      email: 'undoZen@GMail.com',
      password: '123123123'
    }
    userModel.qGetUserByEmail(uo.email)
    .then(function (user) {
      assert.equal(user.id, userObj.id);
      return userModel.qAddUser(uo);
    })
    .fail(function (err) {
      assert.equal(err.message, 'email exists');
      done();
    }).done();
  });

});
