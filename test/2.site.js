var assert = require('assert');
var supertest = require('supertest');

var Q = require('q');
var _ = require('lodash');

var app = require('../');

describe('site model: ', function () {

  it('can add site', function (done) {
    var siteObj = {
      name: '面壁計劃',
      domain: 'www.mian.bz',
      customDomain: 'www.mianbizhe.com',
      ownerId: 1
    };
    supertest(app)
      .post('/site')
      .type('json')
      .send(siteObj)
      .expect(201, function (err, res) {
        assert.ok(!err);
        assert.equal(res.body.id, 1);
        assert.equal(res.body.name, siteObj.name);
        done();
      });
  });

  it('can add more sites', function (done) {
    supertest(app)
    .post('/site')
    .type('json')
    .send({
      name: '無用之用',
      domain: 'wyzy.mian.bz',
      ownerId: 1
    })
    .expect(201, function (err, res) {
      assert.ok(!err);
      assert.equal(res.body.id, 2);
      supertest(app)
      .post('/site')
      .type('json')
      .send({
        name: '氣質大自然',
        domain: 'qznature.mianbz.com',
        customDomain: 'www.qznature.com',
        ownerId: 2
      })
      .expect(201, function (err, res) {
        assert.ok(!err);
        assert.equal(res.body.id, 3);
        done();
      });
    });
  });

  it('can list all sites', function (done) {
    supertest(app)
    .get('/site')
    .expect(200, function (err, res) {
      assert(!err);
      assert.equal(res.body.length, 3);
      done();
    });
  });

  it('can list sites by user id', function (done) {
    supertest(app)
    .get('/site?userId=1')
    .expect(200, function (err, res) {
      assert(!err);
      assert.equal(res.body.length, 2);
      supertest(app)
      .get('/site?userId=2')
      .expect(200, function (err, res) {
        assert(!err);
        assert.equal(res.body.length, 1);
        done();
      });
    });
  });

  it('return 404 and null if not found', function (done) {
    supertest(app)
    .get('/site?domain=notexists.com')
    .expect(404, function (err, res) {
      assert(!err);
      assert.strictEqual('null', res.text);
      done();
    });
  });

  it('can get site by domain', function (done) {
    supertest(app)
    .get('/site?domain=www.qznature.com')
    .expect(200, function (err, res) {
      assert(!err);
      var site1 = res.body;
      supertest(app)
      .get('/site?domain=qznature.mianbz.com')
      .expect(200, function (err, res) {
        assert(!err);
        var site2 = res.body;
        assert.equal(site1.id, site2.id);
        assert.equal(site1.ownerId, 2);
        done();
      });
    });
  });

  it('can get sites by domain arrays', function (done) {
    supertest(app)
    .get('/site?domain=www.qznature.com&domain=qznature.mianbz.com')
    .expect(200, function (err, res) {
      if (err) { console.error(err.stack); console.error(res.text) };
      assert(!err);
      assert.equal(res.body.length, 2);
      var site1 = res.body[0];
      var site2 = res.body[1];
      assert.equal(site1.id, site2.id);
      assert.equal(site1.ownerId, 2);
      done();
    });
  });

  it('can get site by id', function (done) {
    supertest(app)
    .get('/site/3')
    .expect(200, function (err, res) {
      if (err) { console.error(err.stack); console.error(res.text) };
      assert(!err);
      var site1 = res.body;
      supertest(app)
      .get('/site?domain=qznature.mianbz.com')
      .expect(200, function (err, res) {
        assert(!err);
        var site2 = res.body;
        assert.equal(site1.id, site2.id);
        assert.equal(site1.ownerId, 2);
        done();
      });
    });
  });

});
