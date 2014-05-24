var assert = require('assert');
describe('start', function () {
  it('ensure a tdd approach', function (done) {
    process.nextTick(function () {
      assert(true);
      done();
    });
  });
})
