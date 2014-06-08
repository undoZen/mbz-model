var assert = require('assert');
var fs = require('fs');
var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
describe('start', function () {
  before(function (done) {
    qdb.flushall()
    .then(knex.raw.bind(knex, 'drop table if exists user;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/user.sql', 'utf-8')))
    .then(knex.raw.bind(knex, 'drop table if exists site;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/site.sql', 'utf-8')))
    .then(knex.raw.bind(knex, 'drop table if exists doc;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/doc.sql', 'utf-8')))
    .then(knex.raw.bind(knex, 'drop table if exists doch;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/doch.sql', 'utf-8')))
    .then(knex.raw.bind(knex, 'drop table if exists doclink;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/doclink.sql', 'utf-8')))
    .then(function () {
      done();
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
