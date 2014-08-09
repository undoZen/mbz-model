var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var dbconnection = require('mysql').createConnection(_.merge(
      require('config').mysqlConnection,
      {multipleStatements: true}
    ));
var qdb = require('../lib/db/qdb');
describe('start', function () {
  before(function (done) {
    var sql = fs.readdirSync(__dirname + '/../db/migration')
    .filter(function (filename) {
      if (!filename.match(/\.sql$/i)) return false;
      if (isNaN(Date.parse(filename.substring(0, 24)))) return false;
      return true;
    })
    .map(function (filename) {
      return fs.readFileSync(path.resolve(__dirname, '..', 'db', 'migration', filename), 'utf-8');
    })
    .reduce(function (r, sql) {
      return r + sql;
    }, '');
    qdb.flushall()
    .then(function () {
      dbconnection.connect();
      dbconnection.query(sql);
      dbconnection.end(done);
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
