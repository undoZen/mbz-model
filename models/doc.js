var fs = require('fs');

var Q = require('q');
var marked = require('marked');
var debug = require('debug')('model:doc');

var knex = require('./knex');
var qdb = require('./qdb');
var siteModel = require('./site');

var env = process.env.NODE_ENV || 'development';

/* reflink [链接文字][/link_target] 形式的站内链接 */
var reflink = /\[((?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*)\]\[([^\]]*)\]/g;

exports.qSaveDoc = function(doc) {
  if (!doc.siteId) throw new Error('doc.siteId is required');
  return siteModel.qSiteById(doc.siteId)
  .then(function (site) {
    var queryObj = {siteId: doc.siteId, slug: doc.slug};
    if (site.ownerId != doc.userId) throw new Error('this user can not save to this site');
    return qGetOneDoc(queryObj)
    .then(function (oldDoc) {
      if (oldDoc) {
        return Q(knex('doch').insert(oldDoc))
        .then(function (historyId) {
          return knex('doc').where(queryObj).update(doc);
        })
        .then(function (numRowsAffected) {
          debug(numRowsAffected);
          return oldDoc.docId;
        })
      } else {
        return knex('doc').insert(doc);
      }
    })
  })
  .then(function (docId) {
    doc.docId = docId;
    return doc;
  })
};

exports.qGetOneDoc = qGetOneDoc;
function qGetOneDoc(where) {
  return qGetDocs(where).get(0);
};

exports.qGetDocs = qGetDocs;
function qGetDocs(where) {
  return Q(knex('doc').where(where).select());
}
