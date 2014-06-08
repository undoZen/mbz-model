var config = require('config');

module.exports = require('knex').initialize({
  client: 'mysql',
  connection: config.mysqlConnection
});
