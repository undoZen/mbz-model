'use strict';
var sm = require('simple-migrate');
sm(
  require('config').mysqlConnection,
  __dirname + '/migration',
  new Date,
  function (err) {
    if (err) {
      console.error(err.stack);
      process.exit(1);
    }
  });
