'use strict';

var fs = require('fs');

var Q = require('q');
var marked = require('marked');
var debug = require('log4js-or-debug')('mm:model:doc');
var _ = require('lodash');

var knex = require('../lib/db/knex');
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
  var fromDocId = doc.docId;
  return Q(knex('doclink').where({fromDocId: fromDocId}).del())
  .then(function (numRowsAffected) {
    var queries = [];
    doc.content.replace(reflink, function (all, title, slug) {
      if (slug) {
        slug = normalizeSlug(slug);
        debug('%s', slug);
        queries.push({
          siteId: doc.siteId,
          slug: slug
        });
      }
    });
    return Q.all(queries.length ? queries.map(function (query) {
      return knex('doc').where(query).select();
    }) : [])
    .then(function (results) {
      results = _.flatten(results);
      debug('doclinks: %j', results);
      if (!results.length) return [];
      var doclinks = results.map(function (doc) {
        return {fromDocId: fromDocId, toDocId: doc.docId};
      });
      debug('doclinks: %j', doclinks);
      return knex('doclink').insert(doclinks);
    })
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

function docLinks(f_t, qDoc) {
  return Q(qDoc)
  .then(function (doc) {
    var op = {to: 'from', from: 'to'};
    var where = {};
    where[op[f_t]+'DocId'] = doc.docId;
    var query = knex('doclink')
      .column('doc.siteId', 'doc.docId', 'doc.slug', 'doc.title')
      .join('doc', function () {
        this.on('doclink.'+f_t+'DocId', '=', 'doc.docId');
      }, 'left')
      .where(where);
    debug('docLinks'+f_t.toUpperCase()+' query: %s', query);
    return query.select()
    .then(function (docs) {
      docs.forEach(function (doc) {
        doc.published = true;
      });
      return docs;
    })
  })
}
var docLinksTo = docLinks.bind(null, 'to');
var docLinksFrom = docLinks.bind(null, 'from');

exports.qSaveDoc = function(doc) {
  if (!doc.siteId && !doc.domain) throw new Error('doc.siteId or doc.domain is required');
  var qSite;
  if (doc.domain) {
    qSite = siteModel.qSiteByDomain(doc.domain);
    delete doc.domain;
  } else {
    qSite = siteModel.qSiteById(doc.siteId);
  }
  return qSite
  .then(function (site) {
    if (!site) throw new Error('site not found');
    var queryObj = {siteId: doc.siteId, slug: doc.slug};
    if (site.ownerId != doc.userId) throw new Error('this user can not save to this site');
    doc.title = doc.content.trim().replace(/^#+/, '').split(/\r?\n/)[0];
    doc.slug = normalizeSlug(doc.slug);
    if (!doc.title) doc.title = doc.slug;
    else if (doc.title.length > 50) doc.title = doc.title.substring(0, 47) + '...';
    debug('before save: %j', doc);
    return qGetOneDoc(queryObj)
    .then(function (oldDoc) {
      debug('oldDoc: %j', oldDoc);
      doc.revision = oldDoc ? oldDoc.revision : 1;
      if (oldDoc && oldDoc.published) {
        //如果最新文章是草稿，那麼 revision 應該相同
        //就是說一個 revision 是從有草稿保存到 published 爲止
        doc.revision += 1;
      }
      if (oldDoc && doc.published) {
        debug('%j', oldDoc);
        if ('html' in oldDoc) delete oldDoc.html;
        return Q([sumkey(oldDoc), docLinksFrom(oldDoc)])
        .spread(function (cacheKey, linksFrom) {
          debug('linksFrom: %j', linksFrom);
          var ids = linksFrom.map(sumkey).concat(cacheKey);
          debug('cacheKeys: %j', ids);
          debug('oldDoc save to doch: %j', oldDoc);
          Q(knex('doch').insert(oldDoc))
          .fail(function (err) {
            console.error(err)
          })
          return knex('doc').where(queryObj).update(doc);
        })
        .then(function (numRowsAffected) {
          debug(numRowsAffected);
          doc.docId = oldDoc.docId;
          return doc;
        })
      } else {
        //草稿只進 doch 表
        if (oldDoc) {
          doc.docId = oldDoc.docId;
        }
        debug('saving doc: %j', doc)
        debug('oldDoc before saving new doc: %j', oldDoc)
        return knex(doc.published ? 'doc' : 'doch').insert(doc)
        .then(function (docId) {
          if (!doc.docId) {
            doc.docId = Array.isArray(docId)
              ? docId[0]
              : docId;
          }
          if (doc.published) {
            return qGetOneDoc({docId: doc.docId})
          } else {
            return qGetOneDocH({docId: doc.docId});
          }
        })
      }
    })
  })
  .then(function (doc) {
    debug('%j', doc);
    return doc;
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

var decDocLinks = function (qDoc) {
  return Q(qDoc)
  .then(function (doc) {
    if (!doc) return doc;
    return docLinksTo(doc)
    .then(function (results) {
      debug('docLinksTo results: %j', results);
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
  debug('qGetOneDoc where: %j', where);
  return qGetDocs(where).get(0)
  .then(function (doc) {
    debug('qGetOneDoc before decDocLinks: %j', doc);
    return decDocLinks(doc);
  })
};

exports.qGetDocs = qGetDocs;
function qGetDocs(where) {
  return Q(knex('doc').where(where).orderBy('updatedAt', 'desc').select());
}

exports.qGetOneDocH = qGetOneDocH;
function qGetOneDocH(where) {
  debug('qGetOneDocH where: %j', where);
  return qGetDocsH(where).get(0)
  .then(function (doc) {
    debug('qGetOneDocH before decDocLinks: %j', doc);
    return decDocLinks(doc);
  })
};

exports.qGetDocsH = qGetDocsH;
function qGetDocsH(where) {
  return Q(knex('doch').where(where).orderBy('id', 'desc').select());
}
