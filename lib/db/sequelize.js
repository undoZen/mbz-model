'use strict';
var Sequelize = require('sequelize');
var sequelize = exports = module.exports = new Sequelize('mbztest', 'mbztest', 'mbzTEST');
exports.User = require('../../models/user');
exports.Site = require('../../models/site');
