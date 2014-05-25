var Q = require('q');
var knex = require('./knex');
var fs = require('fs');
var env = process.env.NODE_ENV || 'development';

