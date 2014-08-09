var Q = require('q');
var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');

var app = new express.Router();
module.exports = app;

var siteModel = require('../models/site');
var docModel = require('../models/doc');
var debug = require('debug')('mm:route:site');

app.route('/')
.post(
  bodyParser.json(),
  bodyParser.urlencoded({extended: true}),
  function (req, res, next) {
    res.statusCode = 201;
    debug('site post req.body: %j', req.body);
    siteModel.qAddSite(req.body)
    .then(function (json) {
      debug('site post res.json: %j', json);
      res.json(json);
    })
    .fail(function (err) {
      debug('site post err: %s', err.stack);
      throw err;
    })
    .done();
  })
.get(
  function (req, res, next) {
    if (req.query.id) {
      if (Array.isArray(req.query.id)) {
        res.json(siteModel.qSitesByIds(req.query.id));
      } else {
        res.json(siteModel.qSitesById(req.query.id));
      }
    } else if (req.query.domain) {
      if (Array.isArray(req.query.domain)) {
        Q.all(req.query.domain.map(function (domain) {
          return siteModel.qSiteByDomain(domain);
        }))
        .then(res.json.bind(res))
        .fail(next)
        .done();
      } else {
        resjson(siteModel.qSiteByDomain(req.query.domain));
      }
    } else if (req.query.userId) {
      res.json(siteModel.qSitesByUserId(req.query.userId));
    } else {
      res.json(siteModel.qAllSites());
    }
    function resjson(pSite) {
      pSite.then(function (site) {
        if (!site) {
          res.json(null);
          res.statusCode = 404;
        } else {
          res.json(site);
        }
      })
      .fail(function (err) {
        debug('site get err: %s', err.stack);
        throw err;
      })
      .done()
    }
  })

app.route('/:id')
.get(
  function (req, res, next) {
    res.json(siteModel.qSiteById(req.params.id));
  },
  function (err, req, res, next) {
    res.json({error_message: err.message});
  })

app.route('/:siteId/doc')
.post(
  bodyParser.json(),
  bodyParser.urlencoded({extended: true}),
  function (req, res, next) {
    res.statusCode = 201;
    res.json(docModel.qSaveDoc(_.extend({}, req.body, req.params)));
  })

app.route(/^\/(\d+)\/doc(\/.+)/)
.put(
  bodyParser.json(),
  bodyParser.urlencoded({extended: true}),
  function (req, res, next) {
    res.statusCode = 201;
    var doc = _.extend({}, req.body);
    doc.siteId = parseInt(req.params[0], 10);
    doc.slug = req.params[1];
    res.json(docModel.qSaveDoc(doc));
  })

app.route('/:siteId/doc/:docId')
.get(
  function (req, res, next) {
    var queryObj = _.pick(req.params, 'siteId', 'docId');
    queryObj.published = req.query.published !== 'false';
    res.json(docModel.qGetOneDoc(queryObj));
  },
  function (err, req, res, next) {
    res.json({error_message: err.message});
  })
