var Q = require('q');
var _ = require('lodash');

var qdb = require('../lib/db/qdbl');
var crypt = require('../lib/crypt');

exports.qAddUser = function (user) {
  var u = _.extend({}, user);
  u.password = crypt.ghash(u.password);
  var lusername = u.username.toLowerCase();
  var lemail = u.email.toLowerCase();
  return Q.allSettled([
      qdb.user.username.get(lusername),
      qdb.user.email.get(lemail)
  ])
  .then(function (results) {
    var err = results.map(function (r) {
      return r.reason
    }).filter(function (r) {
      return r && r.name != 'NotFoundError';
    });
    if (results[0].state === 'fulfilled') {
      throw new Error('username already exists');
    } else if (results[1].state === 'fulfilled') {
      throw new Error('email already exists');
    } else if (err.length) {
      throw err[0];
    }
  })
  .then(function () {
    return qdb.global.inc('userCount', 0)
  })
  .then(function (id) {
    u.id = id;
    return qdb.batch([
      {type: 'put', key: lusername, value: id, prefix: qdb.user.username._db},
      {type: 'put', key: lemail, value: id, prefix: qdb.user.email._db},
      {type: 'put', key: id, value: u, prefix: qdb.user.profile._db}

    ])
  })
  .then(function () {
    return u;
  })
};

exports.qGetUserById = function (id) {
  return qdb.user.profile.get(id)
  .fail(function (err) {
    return Q({id: -1});
  });
};

exports.qGetUserByUsername = function (username) {
  var pNotFound = Q({id: -1});
  if (!username) return pNotFound;
  return qdb.user.username.get(username.toLowerCase())
  .then(function (id) {
    return exports.qGetUserById(id);
  })
  .fail(function (err) {
    return pNotFound;
  });
};

exports.qGetUserByEmail = function (email) {
  var pNotFound = Q({id: -1});
  if (!email) return pNotFound;
  return qdb.user.email.get(email.toLowerCase())
  .then(function (id) {
    return exports.qGetUserById(id);
  })
  .fail(function (err) {
    return pNotFound;
  });
};
