'use strict';

var debug = require('debug')('mm:cache');
var Q = require('q');
var qdb = require('./db/qdb');
var ldb = require('./db/ldb');

module.exports = function (fn, sumkey, prefix) {
  prefix = 'undefined' != typeof prefix ? prefix : 'cache:';
  sumkey = 'function' == typeof sumkey
    ? sumkey
    : function (key) {
        if ('string' != typeof key || 'number' != typeof key) {
          throw new Error('first arguments should be a string by default,'
             + ' or you can specify a sumkey() function to generate a key for custom object.');
        }
        return Q(''+key);
      }
  return function () {
    var that = this, args = arguments;
    debug('args: %j', args);
    if (!args[0]) return Q(void 0);
    else return Q(sumkey.apply(that, args))
    .then(function (key) {
      key = prefix + key;
      debug('key: %s', key);
      return [key, qdb.get(key)]
    })
    .spread(function (key, valueCached) {
      debug('valueCached: %j', valueCached);
      //return fn.apply(that, args);
      if (valueCached) {
        var value = JSON.parse(valueCached);
        if ('createdAt' in value && value.createdAt) value.createdAt = new Date(value.createdAt);
        if ('updatedAt' in value && value.updatedAt) value.updatedAt = new Date(value.updatedAt);
        return value;
      }
      else return Q(fn.apply(that, args))
      .then(function (value) {
        return qdb.set(key, JSON.stringify(value))
        .then(ldb.expire(key, 7*24*60*60))
        .then(Q.bind(null, value));
      })
    })
  }
}
