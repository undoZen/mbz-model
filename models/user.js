var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
var crypt = require('../utils').crypt;

exports.qAddUser = function (user) {
  var u = _.extend({}, user);
  u.password = crypt.ghash(u.password);
  return Q(knex('user').insert(u))
  //.then(knex('user').insert.bind(knex('user'), u))
  .then(function (ids) {
    return ids[0];
  }, function (err) {
    var match = err.message.match(/^ER_DUP_ENTRY.*for key '([^']+)'/);
    if (match) throw new Error(match[1] + ' already exists');
    else throw err;
  })
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
  return qGetUserByQueryObj({id: id});
  if (!id) return Q({id: -1});
  return qdb.get('user:'+id)
  .then(function (userStr) {
    return JSON.parse(userStr);
  });
};

exports.qGetUserByUsername = function (username) {
  return qGetUserByQueryObj({username: username});
};

exports.qGetUserByQueryObj = qGetUserByQueryObj;
function qGetUserByQueryObj(queryObj) {
  var pNotFound = Q({id: -1});
  return Q(knex('user').where(queryObj).select())
  .then(function (results) {
    return results.length ? results[0] : pNotFound;
  })
  return qdb.get('username2id:'+username.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return exports.qGetUserById(id);
  });
}

exports.qGetUserByEmail = function (email) {
  return qGetUserByQueryObj({email: email});
  var pNotFound = Q({id: -1});
  if (!email) return pNotFound;
  return qdb.get('email2id:' + email.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return exports.qGetUserById(id);
  });
};
