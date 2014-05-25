var Q = require('q');
var _ = require('lodash');

var qdb = require('./qdb');
var ldb = require('./ldb');
var crypt = require('../utils').crypt;

function mapJsonParse(s) {
  return JSON.parse(s);
}

function mapPrependString(str) {
  return function (s) {
    return str + s;
  }
}

exports.qAddCollection = function (collection) {
  var c = _.extend({}, collection);
  if (!c.domain) throw new Error('domain is required');
  var dprop = 'domain2id:' + c.domain.toLowerCase();
  return qdb.get(dprop)
  .then(function (idByDomain) {
    if (idByDomain) throw new Error('domain exists');
    return qdb.incr('global:collectionCount')
  })
  .then(function (id) {
    c.id = id;
    return qdb.mset(
      dprop, id,
      'collection:' + id, JSON.stringify(c)
    )
    .then(ldb.sadd('global:collections', id))
    .then(ldb.sadd('user:'+c.ownerId+':collections', id))
    .then(function () {
      return id;
    });
  });
};

exports.qAllCollection = function (collection) {
  return qdb.smembers('global:collections')
  .then(function (collectionIds) {
    return qdb.mget(collectionIds.map(mapPrependString('collection:')));
  })
  .then(function (collectionJsons) {
    return collectionJsons.map(mapJsonParse);
  })
};

/*

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
*/
