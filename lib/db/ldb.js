var qdb = require('./qdb');

module.exports = ldb;

function ldb(method) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function () {
    qdb[method].apply(qdb, args);
  };
}
Object.keys(qdb).forEach(function (method) {
  ldb[method] = ldb.bind(null, method);
});
