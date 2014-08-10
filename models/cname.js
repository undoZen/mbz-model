var Sequelize = require('sequelize');
var sequelize = require('../lib/db/sequelize');
var CName = exports = module.exports = sequelize.define('CName', {
  domain: {type: Sequelize.STRING, allowNull: false},
  siteId: {type: Sequelize.INTEGER, allowNull: false, references: require('./site'), referenceKey: 'id'}
});
