var assert = require('assert');

var Q = require('q');
var _ = require('lodash');

var crypt = require('../utils').crypt;
var siteModel = require('../models/site');

describe('site model', function () {

  it('can add site', function (done) {
    siteModel.qAddSite({
      name: '面壁計劃',
      domain: 'www.mian.bz',
      customDomain: 'www.mianbizhe.com',
      ownerId: 1
    })
    .then(function (id) {
      assert.equal(id, 1);
      done();
    }).done();
  });

  it('can add more sites', function (done) {
    Q.all([siteModel.qAddSite({
      name: '無用之用',
      domain: 'wyzy.mian.bz',
      ownerId: 1
    }),
    siteModel.qAddSite({
      name: '氣質大自然',
      domain: 'qznature.mianbz.com',
      customDomain: 'www.qznature.com',
      ownerId: 2
    })])
    .spread(function (id2, id3) {
      assert.equal(id2, 2);
      assert.equal(id3, 3);
      done();
    }).done();
  });

  it('can list all sites', function (done) {
    siteModel.qAllSites()
    .then(function (sites) {
      assert.equal(sites.length, 3);
      done();
    }).done();
  });

  it('can list sites by user id', function (done) {
    siteModel.qSitesByUserId(1)
    .then(function (sites) {
      assert.equal(sites.length, 2);
      siteModel.qSitesByUserId(2)
      .then(function (sites) {
        assert.equal(sites.length, 1);
        done();
      }).done();
    }).done();
  });

  it('can get site by domain', function (done) {
    Q.all([siteModel.qSiteByDomain('qznature.mianbz.com'), siteModel.qSiteByDomain('www.qznature.com')])
    .spread(function (site1, site2) {
      assert.equal(site1.id, site2.id);
      assert.equal(site1.ownerId, 2);
      done();
    }).done();
  });

  it('can get site by id', function (done) {
    Q.all([siteModel.qSiteById(3), siteModel.qSiteByDomain('www.qznature.com')])
    .spread(function (site1, site2) {
      assert.equal(site1.id, site2.id);
      assert.equal(site1.ownerId, 2);
      done();
    }).done();
  });

});
