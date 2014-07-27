'use strict';
var Q = require('q');
var is = require('is-type');
var _ = require('lodash');
var db = require('./level');

var methods = 'get put del batch inc'.split(' ');
function wrapDb(db) {
  var result = {};
  methods.forEach(function (k) {
    if (is.function(db[k])) {
      result[k] = Q.ninvoke.bind(Q, db, k);
    }
  });
  if (db.sublevels && Object.keys(db.sublevels).length) {
    Object.keys(db.sublevels).forEach(function (k) {
      if (is.object(db[k]) && Object.keys(_.pick(db[k], methods)).length >= 4) {
        result[k] = wrapDb(db.sublevels[k]);
      }
    });
  }
  result._db = db;
  return result;
}

module.exports = wrapDb(db);
