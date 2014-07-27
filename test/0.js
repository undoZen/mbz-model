var assert = require('assert');
var db = require('../lib/db/redis');
describe('start', function () {
  before(function (done) {
    db.flushall(done);
  });

  it('reset database', function (done) {
    process.nextTick(function () {
      assert(true);
      done();
    });
  });
})
