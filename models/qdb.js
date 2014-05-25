var Q = require('q');

var redis = require('redis');
var db = redis.createClient(6789);
var qdb = {};

for (var k in db) {
  if ('function' == typeof db[k]) {
    qdb[k] = Q.ninvoke.bind(Q, db, k);
  }
}

db.on('error', console.log.bind(console));
db.on('end', console.log.bind(console));

module.exports = qdb;
