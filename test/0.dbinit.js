var assert = require('assert');
var fs = require('fs');
var path = require('path');
var sm = require('simple-migrate');
var qdb = require('../lib/db/qdb');
var _ = require('lodash');
var config = require('config');
_.merge(config, require('../config/test.json')); //insure config not overwritten by local.json

describe('start', function () {
  before(function (done) {
    qdb.flushall()
    .then(function () {
      sm(
        config.mysqlConnection,
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
