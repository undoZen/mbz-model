var fs = require('fs');
var assert = require('assert');
var Q = require('q');

var spawn = require('child_process').spawn;

var crypt = require('../utils').crypt;
var userModel = require('../models/user');

describe('user model', function () {
  var child;
  before(function (done) {
    fs.unlink(__dirname + '/../tmp/redis/dump.rdb', function () {
      child = spawn('redis-server', [__dirname + '/../config/test_redis.conf']);
      var doneCalled = false;
      child.stdout.on('data', function () {
        if (doneCalled) return;
        doneCalled = true;
        done();
      });
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
});
