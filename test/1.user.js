var assert = require('assert');
var Q = require('q');

var _ = require('lodash');

var crypt = require('../utils').crypt;
var userModel = require('../models/user');

describe('user model', function () {

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
      delete user.updatedAt;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('can get user by username', function (done) {
    userModel.qGetUserByUsername(userObj.username)
    .then(function (user) {
      delete user.password;
      delete user.createdAt;
      delete user.updatedAt;
      assert.deepEqual(user, userObj);
      done();
    }).done();
  });

  it('can get user by email', function (done) {
    userModel.qGetUserByEmail(userObj.email)
    .then(function (user) {
      delete user.password;
      delete user.createdAt;
      delete user.updatedAt;
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
      delete user.updatedAt;
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
      delete user.updatedAt;
      assert.deepEqual(user, userObj);
      return userModel.qAddUser(uo);
    })
    .fail(function (err) {
      assert.equal(err.message, 'email already exists');
      done();
    }).done();
  });

});
