'use strict';
var sm = require('simple-migrate');
sm(
  require('config').mysqlConnection,
  __dirname + '/migration',
  new Date,
  function (err, sql, files) {
    if (err) {
      console.error(err.stack);
      process.exit(1);
    }
    console.log('migrated files:', filse);
  });
