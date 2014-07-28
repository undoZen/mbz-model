var Q = require('q');

var config = require('config');
var redis = require('redis');
var env = process.env.NODE_ENV || 'development';
var db = redis.createClient(config.redisConnection);
var qdb = {};

for (var k in db) {
  if ('function' == typeof db[k]) {
    qdb[k] = Q.ninvoke.bind(Q, db, k);
  }
}

db.on('error', console.log.bind(console));

module.exports = qdb;
