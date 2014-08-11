var assert = require('assert');
var fs = require('fs');
var path = require('path');
var sm = require('simple-migrate');
var _ = require('lodash');
var config = require('config');
_.merge(config, require('../config/default.json'), require('../config/test.json')); //insure config not overwritten by local.json
var sequelize = require('../lib/db/sequelize')

describe('start', function () {
  before(function (done) {
    var _config = JSON.parse(JSON.stringify(config));
    console.error(_config);
    sequelize.sync({force: true})
    .then(function () {
      sm(
        _config.mysqlConnection,
        __dirname + '/../db/migration',
        new Date(0),
        done);
    }, done);
  });

  it('reset database', function (done) {
    process.nextTick(function () {
      assert(true);
      done();
    });
  });
})
