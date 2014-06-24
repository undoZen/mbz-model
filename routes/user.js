var Q = require('q');
var express = require('express');
var bodyParser = require('body-parser');

var app = new express.Router();
module.exports = app;

var userModel = require('../models/user');

app.route('/')
  .post(
    bodyParser.json(),
    bodyParser.urlencoded(),
    function (req, res, next) {
      res.statusCode = 201;
      res.json(userModel.qAddUser(req.body));
    })
  .get(
    function (req, res, next) {
      if (req.query.username) {
        res.json(userModel.qGetUserByUsername(req.query.username));
      } else if (req.query.email) {
        res.json(userModel.qGetUserByEmail(req.query.email));
      } else next();
    })

app.route('/:id')
  .get(
    function (req, res, next) {
      res.json(userModel.qGetUserById(req.params.id));
    },
    function (err, req, res, next) {
      res.json({error_message: err.message});
    })
