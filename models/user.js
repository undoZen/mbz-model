var Q = require('q');

var redis = require('redis');
var db = redis.createClient(6789);
var qdb = {};

var crypt = require('../utils').crypt;

for (var k in db) {
  if ('function' == typeof db[k]) {
    qdb[k] = Q.ninvoke.bind(Q, db, k);
  }
}

exports.qAddUser = function (user) {
  var u = {};
  Object.keys(user).forEach(function (k) {
    u[k] = user[k];
  });
  u.password = crypt.ghash(u.password);
  return qdb.incr('global:userCount')
  .then(function (id) {
    u.id = id;
    return qdb.set('username2id:' + u.username, id)
    .then(qdb.set('user:'+id, JSON.stringify(u)))
    .then(function () {
      return id;
    });
  });
};

exports.qGetUserById = function (id) {
  if (!id) return Q({id: -1});
  return qdb.get('user:'+id)
  .then(function (userStr) {
    return JSON.parse(userStr);
  });
};

exports.qGetUserByUsername = function (username) {
  var pNotFound = Q({id: -1});
  if (!username) return pNotFound;
  return qdb.get('username2id:'+username)
  .then(function (id) {
    if (!id) return pNotFound;
    return exports.qGetUserById(id);
  });
};
