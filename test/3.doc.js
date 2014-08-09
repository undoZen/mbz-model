var assert = require('assert');
var Q = require('q');
var supertest = require('supertest');

var docModel = require('../models/doc');
var app = require('../');
var ef = require('errto');
var arity = require('fn-arity');

describe('doc model: ', function () {
  var gefn = function(done) {
    return arity(2, ef.bind(null, function (err, res) {
      done(err);
    }));
  }

  it('can save doc and return saved doc', function (done) {
    var efn = gefn(done);
    supertest(app)
    .post('/site/1/doc')
    .type('json')
    .send({
      userId: 1,
      slug: '/hello',
      content: 'world',
      published: true
    })
    .expect(201, efn(function (res) {
      assert.equal(res.body.docId, 1);
      supertest(app)
      .post('/site/1/doc')
      .type('json')
      .send({
        userId: 1,
        slug: '/undoZen',
        content: '#Introduce @undoZen\nhello~',
        published: true
      })
      .expect(201, efn(function (res) {
        assert.equal(res.body.docId, 2);
        assert.equal(res.body.slug, '/undozen');
        assert.equal(res.body.revision, 1);
        done();
      }));
    }));
  });

  it('can get one by siteId and docId', function (done) {
    var efn = gefn(done);
    supertest(app)
    .get('/site/1/doc/1')
    .expect(200, efn(function (res) {
      assert.equal(res.body.docId, 1);
      assert.equal(res.body.slug, '/hello');
        assert.equal(res.body.revision, 1);
      done();
    }));
  });

  it('can put a doc by slug', function (done) {
    var efn = gefn(done);
    supertest(app)
    .put('/site/1/doc/hello')
    .type('json')
    .send({
      userId: 1,
      content: 'yes',
      published: true
    })
    .expect(201, efn(function (res) {
      assert.equal(res.body.docId, 1);
      assert.equal(res.body.content, 'yes');
      assert.equal(res.body.revision, 2);
      done();
    }));
  });

  it('can save multiple drafts under the same new revision v3d1', function (done) {
    var efn = gefn(done);
    supertest(app)
    .put('/site/1/doc/hello')
    .type('json')
    .send({
      userId: 1,
      content: 'v3d1',
      published: false
    })
    .expect(201, efn(function (res) {
      assert.equal(1, res.body.docId);
      assert.equal(3, res.body.revision);
      assert.equal('v3d1', res.body.content);
      done();
    }));
  });

  it('can save multiple drafts under the same new revision v3d2', function (done) {
    var efn = gefn(done);
    supertest(app)
    .put('/site/1/doc/hello')
    .type('json')
    .send({
      userId: 1,
      content: 'v3d2',
      published: false
    })
    .expect(201, efn(function (res) {
      assert.equal(1, res.body.docId);
      assert.equal(3, res.body.revision);
      assert.equal('v3d2', res.body.content);
      done();
    }));
  });

  it('will get published doc by default', function (done) {
    var efn = gefn(done);
    supertest(app)
    .get('/site/1/doc/1')
    .expect(200, efn(function (res) {
      assert.equal(2, res.body.revision);
      assert.equal('yes', res.body.content);
      done();
    }));
  });

  it('can save new version of a doc if slug exists', function (done) {
    var efn = gefn(done);
    supertest(app)
    .post('/site/1/doc')
    .type('json')
    .send({
      userId: 1,
      slug: '/hello',
      content: '#Hello, World!\nI\'m [][undoZen] on [][mian bi zhe]. creator of [MianBiZhe.com][this site]',
      published: true
    })
    .expect(201, efn(function (res) {
      assert.equal(res.body.docId, 1);
      assert.equal(res.body.revision, 3);
      assert(res.body.content.match(/Hello/));
      done();
    }));
  });

  it('can get doc with auto-generated title and doclinks', function (done) {
    var efn = gefn(done);
    supertest(app)
    .get('/site/1/doc/1')
    .expect(200, efn(function (res) {
      assert.equal(3, res.body.revision);
      assert.equal(res.body.title, 'Hello, World!');
      done();
    }));
  });

  it('change referee doc update referer doc.html', function (done) {
    var efn = gefn(done);
    supertest(app)
    .post('/site/1/doc')
    .type('json')
    .send({
      userId: 1,
      siteId: 1,
      slug: '/undoZen',
      content: '#Hi, I\'m @undoZen\nhello~',
      published: true
    })
    .expect(201, efn(function (res) {
      assert.equal(res.body.docId, 2);
      supertest(app)
      .get('/site/1/doc/1')
      .expect(200, efn(function (res) {
        assert(res.body.html.match(/Hi, I'm/));
        done();
      }));
    }));
  });

});
