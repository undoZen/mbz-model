var fs = require('fs');
var assert = require('assert');
var Q = require('q');

var spawn = require('child_process').spawn;

var knex = require('../models/knex');
var docModel = require('../models/doc');

describe('user model', function () {

  before(function (done) {
    var sql = fs.readFileSync(__dirname + '/../models/doc.sql', 'utf-8');
    knex.raw('drop table doc;')
    .then(knex.raw.bind(knex, sql))
    .then(function () {
      done();
    }, done);
  });

  it('will be ok', function () {
    assert(true);
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
      done();
    }).done();
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

});
