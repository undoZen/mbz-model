var Q = require('q');
var express = require('express');
var bodyParser = require('body-parser');

var app = new express.Router();
module.exports = app;

var docModel = require('../models/doc');

app.route('/')
.post(
  bodyParser.json(),
  bodyParser.urlencoded({extended: true}),
  function (req, res, next) {
    res.statusCode = 201;
    res.json(docModel.qSaveDoc(req.body));
  })
.get(
  function (req, res, next) {
    if (req.query.id) {
      if (Array.isArray(req.query.id)) {
        res.json(docModel.qSitesByIds(req.query.id));
      } else {
        res.json(docModel.qSitesById(req.query.id));
      }
    } else if (req.query.domain) {
      if (Array.isArray(req.query.domain)) {
        Q.all(req.query.domain.map(function (domain) {
          return docModel.qSiteByDomain(domain);
        }))
        .then(res.json.bind(res))
        .fail(next)
        .done();
      } else {
        res.json(docModel.qSiteByDomain(req.query.domain));
      }
    } else if (req.query.userId) {
      res.json(docModel.qSitesByUserId(req.query.userId));
    } else {
      res.json(docModel.qAllSites());
    }
  })

/*
app.route('/:id')
.get(
  function (req, res, next) {
    res.json(docModel.qSiteById(req.params.id));
  },
  function (err, req, res, next) {
    res.json({error_message: err.message});
  })
*/
