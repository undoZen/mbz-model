var fs = require('fs');
var assert = require('assert');
var Q = require('q');

var spawn = require('child_process').spawn;

var knex = require('../lib/db/knex');
var docModel = require('../models/doc');

describe('user model', function () {

  before(function (done) {
    knex.raw('drop table if exists doc;')
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/doc.sql', 'utf-8')))
    .then(knex.raw.bind(knex, 'drop table if exists doch;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/doch.sql', 'utf-8')))
    .then(knex.raw.bind(knex, 'drop table if exists doclink;'))
    .then(knex.raw.bind(knex, fs.readFileSync(__dirname + '/../models/doclink.sql', 'utf-8')))
    .then(function () {
      done();
    }, done);
  });

  it('can save doc and return saved doc', function (done) {
    docModel.qSaveDoc({
      userId: 1,
      siteId: 1,
      slug: '/hello',
      content: 'world',
      published: true
    })
    .then(function (doc) {
      assert.equal(doc.docId, 1);
      return docModel.qSaveDoc({
        userId: 1,
        siteId: 1,
        slug: '/undoZen',
        content: '#Introduce @undoZen\nhello~',
        published: true
      })
    })
    .then(function (doc) {
      assert.equal(doc.docId, 2);
      assert.equal(doc.slug, '/undozen');
      done();
    })
    .done();
  });

  it('can get docs by siteId and docId', function (done) {
    docModel.qGetDocs({
      siteId: 1,
      docId: 1
    })
    .then(function (docs) {
      assert.equal(docs[0].docId, 1);
      assert.equal(docs[0].slug, '/hello');
      done();
    }).done();
  });

  it('can get one by siteId and docId', function (done) {
    Q.all(docModel.qGetDocs({
      siteId: 1,
      docId: 1
    }), docModel.qGetOneDoc({
      siteId: 1,
      docId: 1
    }))
    .spread(function (docs, doc) {
      assert.deepEqual(docs[0], doc);
      done();
    }).done();
  });

  it('can save new version of a doc if slug exists', function (done) {
    docModel.qSaveDoc({
      userId: 1,
      siteId: 1,
      slug: '/hello',
      content: '#Hello, World!\nI\'m [][undoZen] on [][mian bi zhe]. creator of [MianBiZhe.com][this site]',
      published: true
    })
    .then(function (doc) {
      assert.equal(doc.docId, 1);
      return docModel.qGetDocs({
        siteId: 1,
        docId: 1
      });
    })
    .then(function (docs) {
      //assert.equal(docs.filter(function (doc) { return doc.history; }).length, 1);
      //assert.equal(docs.filter(function (doc) { return !doc.history; }).length, 1);
      assert.equal(docs.length, 1);
      done();
    }).done();
  });

  it('can get doc with auto-generated title and doclinks', function (done) {
    docModel.qGetOneDoc({
      siteId: 1,
      slug: '/hello'
    })
    .then(function (doc) {
      assert.equal(doc.title, 'Hello, World!');
      done();
    })
    .done();
  });

  it('change referee doc update referer doc.html', function (done) {
    docModel.qSaveDoc({
      userId: 1,
      siteId: 1,
      slug: '/undoZen',
      content: '#Hi, I\'m @undoZen\nhello~',
      published: true
    })
    .then(function (doc) {
      assert(doc.docId > 1)
      console.log(doc);
      return docModel.qGetOneDoc({siteId: 1, docId: 1});
    })
    .then(function (doc1) {
      console.log(doc1);
      done();
    })
    .done();
  });

});
