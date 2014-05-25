var fs = require('fs');
var assert = require('assert');
var Q = require('q');

var spawn = require('child_process').spawn;

var knex = require('../models/knex');
var docModel = require('../models/doc');

describe('user model', function () {

  before(function (done) {
    var sql = fs.readFileSync(__dirname + '/../models/doc.sql', 'utf-8');
    knex.raw('drop table doc;')
    .then(knex.raw.bind(knex, sql))
    .then(function () {
      done();
    }, done);
  });

  it('will be ok', function () {
    assert(true);
  });

});
