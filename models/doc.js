'use strict';

var fs = require('fs');

var Q = require('q');
var marked = require('marked');
var debug = require('debug')('model:doc');

var knex = require('../lib/db/knex');
var qdb = require('../lib/db/qdb');
var siteModel = require('./site');
var cache = require('../lib/cache');

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

function docLinks(f_t, qDoc) {
  return Q(qDoc)
  .then(function (doc) {
    var op = {to: 'from', from: 'to'};
    var where = {};
    where[op[f_t]+'SiteId'] = doc.siteId;
    where[op[f_t]+'Slug'] = doc.slug;
    var query = knex('doclink')
      .column('doc.siteId', 'doc.docId', 'doc.slug', 'doc.title')
      .join('doc', function () {
        this.on('doclink.'+f_t+'SiteId', '=', 'doc.siteId');
        this.on('doclink.'+f_t+'Slug', '=', 'doc.slug');
      }, 'left')
      .where(where);
    debug('docLinks'+f_t.toUpperCase()+' query: %s', query);
    return query.select();
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
      if (oldDoc) {
        debug('%j', oldDoc);
        if ('html' in oldDoc) delete oldDoc.html;
        return Q([sumkey(oldDoc), docLinksFrom(oldDoc)])
        .spread(function (cacheKey, linksFrom) {
          debug('linksFrom: %j', linksFrom);
          var ids = linksFrom.map(sumkey).concat(cacheKey);
          debug('cacheKeys: %j', ids);
          return qdb.del(ids);
        })
        .then(function (deletedCache) {
          debug('deletedCache: %s', deletedCache);
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
function sumkey(doc) {
    debug('sumkey doc: %j', doc);
    var result = 'cache:' + doc.siteId + ':' + doc.docId;
    debug('sumkey result: %s', result);
    return result;
}
decDocLinks = cache(decDocLinks, sumkey, '');

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
