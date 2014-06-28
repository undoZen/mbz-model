var Q = require('q');
var express = require('express');
var bodyParser = require('body-parser');

var app = new express.Router();
module.exports = app;

var siteModel = require('../models/site');

app.route('/')
.post(
  bodyParser.json(),
  bodyParser.urlencoded({extended: true}),
  function (req, res, next) {
    res.statusCode = 201;
    res.json(siteModel.qAddSite(req.body));
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
        res.json(siteModel.qSiteByDomain(req.query.domain));
      }
    } else if (req.query.userId) {
      res.json(siteModel.qSitesByUserId(req.query.userId));
    } else {
      res.json(siteModel.qAllSites());
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
