var fs = require('fs');

var Q = require('q');
var marked = require('marked');
var debug = require('debug')('model:doc');

var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
var siteModel = require('./site');

var env = process.env.NODE_ENV || 'development';

/* reflink [链接文字][/link_target] 形式的站内链接 */
var reflink = /\[((?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*)\]\[([^\]]*)\]/g;

function normalizeSlug(slug) {
  slug = slug.toLowerCase().replace(/\s/g, '_');
  slug = slug[0] == '/' ? slug : '/' + slug;
  return slug;
}

function qSaveDocLinks(doc) {
  return Q(knex('doclink').where({fromSiteId: doc.siteId, fromSlug: doc.slug}).del())
  .then(function (numRowsAffected) {
    var qs = [];
    doc.content.replace(reflink, function (all, title, slug) {
      debug('%j', arguments);
      if (slug) {
        slug = normalizeSlug(slug);
        qs.push({
          fromSiteId: doc.siteId,
          fromSlug: doc.slug,
          toSiteId: doc.siteId,
          toSlug: slug
        });
      }
    });
    return Q.all(qs.length ? knex('doclink').insert(qs) : [])
    .then(function () {
      return doc;
    })
  })
}

function decTitle(doc) {
  doc.html.replace(/<h1[^>]*>([^\n]+)<\/h1>/i, function (all, title) {
    doc.title = title;
  });
  if (!doc.title) doc.title = doc.slug;
  return doc;
}

exports.qSaveDoc = function(doc) {
  if (!doc.siteId) throw new Error('doc.siteId is required');
  return siteModel.qSiteById(doc.siteId)
  .then(function (site) {
    var queryObj = {siteId: doc.siteId, slug: doc.slug};
    if (site.ownerId != doc.userId) throw new Error('this user can not save to this site');
    doc.title = doc.content.trim().replace(/^#+/, '').split(/\r?\n/)[0];
    doc.slug = slug = normalizeSlug(doc.slug);
    if (!doc.title) doc.title = doc.slug;
    else if (doc.title.length > 50) doc.title = doc.title.substring(0, 47) + '...';
    return qGetOneDoc(queryObj)
    .then(function (oldDoc) {
      if (oldDoc) {
        debug('%j', oldDoc);
        if ('html' in oldDoc) delete oldDoc.html;
        return Q(knex('doch').insert(oldDoc))
        .then(function (historyId) {
          return knex('doc').where(queryObj).update(doc);
        })
        .then(function (numRowsAffected) {
          debug(numRowsAffected);
          doc.docId = oldDoc.docId;
          return doc;
        })
      } else {
        return knex('doc').insert(doc)
        .then(function (docId) {
          doc.docId = docId;
          return doc;
        })
      }
    })
  })
  .then(qSaveDocLinks)
};

function addHtml(doc, titles) {
  doc.html = marked(doc.content);
  doc.html = doc.html.replace(reflink, function (all, title, slug) {
    if (!slug) return title;
    var rslug = normalizeSlug(slug);
    title = title || titles[rslug] || slug.replace(/^\//, '');
    return '<a href="' + rslug + '">' + title + '</a>';
  });
  return doc;
}

function decDocLinks(qDoc) {
  return Q(qDoc)
  .then(function (doc) {
    if (!doc) return doc;
    var query = knex('doclink')
      .column('doclink.toSiteId as siteId', 'doclink.toSlug as slug', 'doc.title')
      .join('doc', function () {
        this.on('doclink.toSiteId', '=', 'doc.siteId');
        this.on('doclink.toSlug', '=', 'doc.slug');
      }, 'left')
      .where({fromSiteId: doc.siteId, fromSlug: doc.slug})
    return Q(query.select())
    .then(function (results) {
      var titles = {};
      results.forEach(function (t) {
        titles[t.slug] = t.title;
      });
      return addHtml(doc, titles);
    })
  })
}

exports.qGetOneDoc = qGetOneDoc;
function qGetOneDoc(where) {
  return qGetDocs(where).get(0)
  .then(decDocLinks)
};

exports.qGetDocs = qGetDocs;
function qGetDocs(where) {
  return Q(knex('doc').where(where).select());
}
