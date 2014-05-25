var fs = require('fs');
var assert = require('assert');
var Q = require('q');

var spawn = require('child_process').spawn;

//var docModel = require('../models/doc');

describe('user model', function () {
  var child;
  before(function (done) {
    child = spawn('redis-server', [__dirname + '/redis.conf']);
    var doneCalled = false;
    child.stdout.on('data', function () {
      if (doneCalled) return;
      doneCalled = true;
      done();
    });
  });

  it('will be ok', function () {
    assert(true);
  });

  after(function (done) {
    child.kill();
    child.on('close', function () {
      fs.unlink(__dirname + '/../tmp/redis/dump.rdb', function () {
        done();
      });
    });
  });

});
