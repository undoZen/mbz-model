'use strict';

var exports = module.exports = {};
var crypt = exports.crypt = {};

var crypto = require('crypto');

var sha1 = crypt.sha1 = function sha1(string) {
  var sha1sum = crypto.createHash('sha1');
  sha1sum.update(string, 'utf8');
  return sha1sum.digest('hex');
}

crypt.ghash = function ghash(string) {
  var ranstr = sha1(Math.random().toString(36)).substring(16);
  return sha1(string + ranstr) + ranstr;
}

crypt.vhash = function vhash(string, hash_salt) {
  var hash = hash_salt.substring(0, 40);
  var salt = hash_salt.substring(40);
  return sha1(string + salt) === hash ? true : false;
}
