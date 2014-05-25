var assert = require('assert');
var Q = require('q');
var _ = require('lodash');

var spawn = require('child_process').spawn;

var crypt = require('../utils').crypt;
var qdb = require('../models/qdb');
var collectionModel = require('../models/collection');

describe('collection model', function () {

  it('can add collection', function (done) {
    collectionModel.qAddCollection({
      name: '面壁計劃',
      domain: 'www.mianbizhe.com',
      ownerId: 1
    })
    .then(function (id) {
      assert.equal(id, 1);
      done();
    }).done();
  });

  it('can add more collections', function (done) {
    Q.all([collectionModel.qAddCollection({
      name: '無用之用',
      domain: 'www.wuyongzhiyong.com',
      ownerId: 1
    }),
    collectionModel.qAddCollection({
      name: '氣質大自然',
      domain: 'www.qznature.com',
      ownerId: 2
    })])
    .spread(function (id2, id3) {
      assert.equal(id2, 2);
      assert.equal(id3, 3);
      done();
    }).done();
  });

  it('can list all collections', function (done) {
    collectionModel.qAllCollection()
    .then(function (collections) {
      assert.equal(collections.length, 3);
      done();
    }).done();
  });


  /*
  var userObj = {
    username: 'undozen',
    password: '123123123',
    email: 'undozen@gmail.com'
  };
  
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
  */

});
