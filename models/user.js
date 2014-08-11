var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var crypt = require('../lib/crypt');

exports.qAddUser = function (user) {
  var u = _.extend({}, user);
  u.password = crypt.ghash(u.password);
  return Q(knex('user').insert(u))
  //.then(knex('user').insert.bind(knex('user'), u))
  .then(function (ids) {
    return qGetUserById(ids[0]);
  }, function (err) {
    var match = err.message.match(/^ER_DUP_ENTRY.*for key '([^']+)'/);
    if (match) throw new Error(match[1] + ' already exists');
    else throw err;
  })
};

var qGetUserByQueryObj = exports.qGetUserByQueryObj = function (queryObj) {
  var pNotFound = Q({id: -1});
  return Q(knex('user').where(queryObj).select())
  .then(function (results) {
    return results.length ? results[0] : pNotFound;
  })
};

exports.qGetUserById = qGetUserById;
function qGetUserById(id) {
  return qGetUserByQueryObj({id: id});
};

exports.qGetUserByUsername = function (username) {
  return qGetUserByQueryObj({username: username});
};

exports.qGetUserByEmail = function (email) {
  return qGetUserByQueryObj({email: email});
};
