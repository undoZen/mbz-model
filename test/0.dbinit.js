var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var sm = require('simple-migrate');
var qdb = require('../lib/db/qdb');
describe('start', function () {
  before(function (done) {
    qdb.flushall()
    .then(function () {
      sm(
        _.merge(
          require('config').mysqlConnection,
          {multipleStatements: true}
        ),
        __dirname + '/../db/migration',
        new Date(0),
        done);
    }, done)
    .done();
  });

  it('reset database', function (done) {
    process.nextTick(function () {
      assert(true);
      done();
    });
  });
})
