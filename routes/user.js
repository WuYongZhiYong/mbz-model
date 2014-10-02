var Q = require('q');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var crypt = require('../lib/crypt');

var app = new express.Router();
module.exports = app;

var userModel = require('../models/user');

app.route('/')
  .post(
    bodyParser.json(),
    bodyParser.urlencoded({extended: true}),
    function (req, res, next) {
      res.statusCode = 201;
      var user = _.pick(req.body, 'username nickname salt password email'.split(' '));
      res.json(userModel.qAddUser(user));
    })
  .get(
    function (req, res, next) {
      var qUser;
      if (req.query.username) {
        qUser = userModel.qGetUserByUsername(req.query.username);
      } else if (req.query.email) {
        qUser = userModel.qGetUserByEmail(req.query.email);
      }
      if (!qUser) return next();
      qUser.then(function (user) {
        delete user.password;
        res.json(user);
      })
      .done();
    })

app.route('/:id')
  .get(
    function (req, res, next) {
      userModel.qGetUserById(req.params.id).then(function (user) {
        delete user.password;
        res.json(user);
      });
    },
    function (err, req, res, next) {
      res.json({error_message: err.message});
    })

app.route('/:id_or_username/salt')
  .get(
    function (req, res, next) {
      if (req.params.id_or_username.match(/^\d+$/)) {
        res.json({salt: userModel.qGetUserById(req.params.id_or_username).get('salt')});
      } else {
        res.json({salt: userModel.qGetUserByUsername(req.params.id_or_username).get('salt')});
      }
    },
    function (err, req, res, next) {
      res.json({error_message: err.message});
    })

app.route('/check_password')
  .post(
    bodyParser.json(),
    bodyParser.urlencoded({extended: true}),
    function (req, res, next) {
      var qUser;
      if (req.body.id) {
        qUser = userModel.qGetUserById(req.body.id);
      } else if (req.body.email) {
        qUser = userModel.qGetUserByEmail(req.body.email);
      } else if (req.body.username) {
        qUser = userModel.qGetUserByUsername(req.body.username);
      }
      if (!qUser) {
        res.json({success: false});
      } else {
        qUser.then(function (user) {
          if (-1 === user.id || !crypt.vhash(req.body.password, user.password)) return res.json({success: false});
          delete user.password;
          res.json({
            success: true,
            user: user
          });
        })
        .done()
      }
    },
    function (err, req, res, next) {
      res.json({error_message: err.message});
    })
