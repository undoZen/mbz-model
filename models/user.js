var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
var cache = require('../lib/cache');
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

var qGetUserByQueryObj = exports.qGetUserByQueryObj = function (queryObj) {
  var pNotFound = Q({id: -1});
  return Q(knex('user').where(queryObj).select())
  .then(function (results) {
    return results.length ? results[0] : pNotFound;
  })
  return qdb.get('username2id:'+username.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return qGetUserById(id);
  });
};

function sumkey(queryObj) {
  return _.reduce(queryObj, function (t, v, k) {return [t,k,v].join(':');},'cache')
}
qGetUserByQueryObj = cache(qGetUserByQueryObj, sumkey);

exports.qGetUserById = qGetUserById;
function qGetUserById(id) {
  return qGetUserByQueryObj({id: id});
};

exports.qGetUserByUsername = function (username) {
  return qGetUserByQueryObj({username: username});
};

exports.qGetUserByEmail = function (email) {
  return qGetUserByQueryObj({email: email});
  var pNotFound = Q({id: -1});
  if (!email) return pNotFound;
  return qdb.get('email2id:' + email.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return qGetUserById(id);
  });
};
