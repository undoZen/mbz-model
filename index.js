var express = require('express');

var app = express();
require('q-locals')(app);

module.exports = app;

app.use('/user', require('./routes/user'));
app.use('/site', require('./routes/site'));

app.use(function (err, req, res, next) {
  res.statusCode = 400;
  res.json({error_message: err.message});
});

if (require.main === module) app.listen(3000);
