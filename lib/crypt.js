'use strict';

var crypto = require('crypto');

var sha512 = exports.sha512 = function sha512(string) {
  var sha512sum = crypto.createHash('sha512');
  sha512sum.update(string, 'utf8');
  return sha512sum.digest('hex');
}

exports.ghash = function ghash(string) {
  return sha512(string || '');
}

exports.vhash = function vhash(string, crypted) {
  return sha512(string) === crypted ? true : false;
}
