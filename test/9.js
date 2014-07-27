var assert = require('assert');
var db = require('../lib/db/level');
var ef = require('errto');
var rimraf = require('rimraf');

describe('clean down', function () {
  before(function (done) {
    db.close(function () {
      rimraf(__dirname + '/../tmp/data', done);
    });
  });

  it('reset database', function (done) {
    process.nextTick(function () {
      assert(true);
      done();
    });
  });
})
