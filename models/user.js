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
  var unprop = 'username2id:' + u.username.toLowerCase();
  var eprop = 'email2id:' + u.email.toLowerCase();
  return qdb.mget([unprop, eprop])
  .spread(function (idByUsername, idByEmail) {
    if (idByUsername) throw new Error('username exists');
    if (idByEmail) throw new Error('email exists');
    return qdb.incr('global:userCount')
    .then(function (id) {
      u.id = id;
      return qdb.mset(
        unprop, id,
        eprop, id,
        'user:' + id, JSON.stringify(u)
      )
      .then(function () {
        return id;
      });
    });
  })
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
  return qdb.get('username2id:'+username.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return exports.qGetUserById(id);
  });
};

exports.qGetUserByEmail = function (email) {
  var pNotFound = Q({id: -1});
  if (!email) return pNotFound;
  return qdb.get('email2id:' + email.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return exports.qGetUserById(id);
  });
};
