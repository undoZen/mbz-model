'use strict';
var env = process.env.NODE_ENV || 'development';
var dbpath = env == 'test' ? __dirname + '/../../tmp/data' : __dirname + '/../../data';
var db = require('levelup')(dbpath, {valueEncoding: 'json'});
var levelplus = require('levelplus');

db = require('level-sublevel')(db);
db = require('level-ttl')(db);
module.exports = db;

db.global = levelplus(db.sublevel('global'));

db.user = db.sublevel('user');
db.user.profile = db.user.sublevel('profile');
db.user.username = db.user.sublevel('username');
db.user.email = db.user.sublevel('email');
db.user.created_at = db.user.sublevel('created_at');

db.site = db.sublevel('site');
