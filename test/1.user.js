var assert = require('assert');
var fs = require('fs');
var Q = require('q');

var knex = require('../models/knex');
var _ = require('lodash');

var crypt = require('../utils').crypt;
var qdb = require('../models/qdb');
var userModel = require('../models/user');

describe('user model', function () {
  before(function (done) {
    //it's the first test case use redis, so flush all
    qdb.flushall()
    .then(knex.raw.bind(knex, 'drop table if exists user;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/user.sql', 'utf-8')))
    .then(function () {
      done();
    }, done)
    .done();
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
      delete user.createdAt;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('can get user by username', function (done) {
    userModel.qGetUserByUsername(userObj.username)
    .then(function (user) {
      delete user.password;
      delete user.createdAt;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('can get user by email', function (done) {
    userModel.qGetUserByEmail(userObj.email)
    .then(function (user) {
      delete user.password;
      delete user.createdAt;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('will throw error when username conflict', function (done) {
    var uo = _.extend({}, userObj);
    delete uo.id;
    userModel.qAddUser(uo)
    .fail(function (err) {
      assert.equal(err.message, 'username already exists');
      done();
    }).done();
  });

  it('will throw error when email conflict', function (done) {
    var uo = _.extend({}, userObj, {username:'helloworld'});
    delete uo.id;
    userModel.qAddUser(uo)
    .fail(function (err) {
      assert.equal(err.message, 'email already exists');
      done();
    }).done();
  });

  it('username should be case-insensitive', function (done) {
    var uo = _.extend({}, userObj, {username:'undoZen'});
    delete uo.id;
    userModel.qGetUserByUsername(uo.username)
    .then(function (user) {
      delete user.password;
      delete user.createdAt;
      assert.deepEqual(user, userObj);
      return userModel.qAddUser(uo);
    })
    .fail(function (err) {
      assert.equal(err.message, 'username already exists');
      done();
    }).done();
  });

  it('email should be case-insensitive', function (done) {
    var uo = _.extend({}, userObj, {username: 'helloworld', email: 'undoZen@GMail.com'});
    delete uo.id;
    userModel.qGetUserByEmail(uo.email)
    .then(function (user) {
      delete user.password;
      delete user.createdAt;
      assert.deepEqual(user, userObj);
      return userModel.qAddUser(uo);
    })
    .fail(function (err) {
      assert.equal(err.message, 'email already exists');
      done();
    }).done();
  });

});
