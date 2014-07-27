'use strict';
var Q = require('q');
var db = require('./redis');

var qdb = {};

for (var k in db) {
  if ('function' == typeof db[k]) {
    qdb[k] = Q.ninvoke.bind(Q, db, k);
  }
}

module.exports = qdb;
