'use strict';
var redis = require('redis');
var db = redis.createClient(6789);
module.exports = db;
db.on('error', console.log.bind(console));
