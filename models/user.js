var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
var cache = require('../lib/cache');
var crypt = require('../lib/crypt');

var Sequelize = require('sequelize');
var sequelize = require('../lib/db/sequelize');
var User = exports = module.exports = sequelize.define('User', {
  username: {type: Sequelize.STRING, allowNull: false, unique: true},
  password: {type: Sequelize.STRING, allowNull: false},
  salt: {type: Sequelize.STRING, allowNull: false},
  email: {type: Sequelize.STRING, allowNull: false, unique: true, validate: {isEmail: true}}
});

exports.qAddUser = function (user) {
  var u = _.extend({}, user);
  u.password = crypt.ghash(u.password);
  return Q(User.create(u))//, 'username password salt email'.split(' '))
  .then(function (user) {
    console.log(user.values)
    return user.values;
  }, function (err) {
    var match = err.message.match(/^ER_DUP_ENTRY.*for key '([^']+)'/);
    if (match) throw new Error(match[1] + ' already exists');
    else throw err;
  })
  /*
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
  */
};

exports.qGetUserByQueryObj = qGetUserByQueryObj;
function qGetUserByQueryObj(queryObj) {
  var pNotFound = Q({id: -1});
  return Q(User.find({where: queryObj}))
  .then(function (result) {
    return result ? result.values : pNotFound;
  })
  /*
  return qdb.get('username2id:'+username.toLowerCase())
  .then(function (id) {
    if (!id) return pNotFound;
    return qGetUserById(id);
  });
  */
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
