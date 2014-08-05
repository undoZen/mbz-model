var express = require('express');

var log4js = require('log4js');
var logDir = path.resolve(process.env.HOME, 'logs');
require('mkdirp').sync(logDir);
log4js.loadAppender('file');
'mm:cache mm:model:doc'.split(' ').forEach(function (namespace) {
  log4js.addAppender(log4js.appenders.file(path.join(logDir, 'mbz-model.log')), namespace);
});

var app = express();
require('q-locals')(app);

module.exports = app;

app.use('/user', require('./routes/user'));
app.use('/site', require('./routes/site'));
app.use('/doc', require('./routes/doc'));

app.use(function (err, req, res, next) {
  res.statusCode = 400;
  res.json({error_message: err.message});
});

if (require.main === module || process.env.NODE_ENV == 'production') app.listen(process.env.PORT || 3000);
