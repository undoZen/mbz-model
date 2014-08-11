var Q = require('q');
var _ = require('lodash');

var knex = require('../lib/db/knex');
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
};

exports.qGetUserByQueryObj = qGetUserByQueryObj;
function qGetUserByQueryObj(queryObj) {
  var pNotFound = Q({id: -1});
  return Q(User.find({where: queryObj}))
  .then(function (result) {
    return result ? result.values : pNotFound;
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
