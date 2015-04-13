/* jshint node:true */
var express = require('express');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var url = require('url');

var config = require('../../../config').fakeCAS;

function Server() {
  this._app = express();
  this._tickets = {};
  this._configureRoutes();
}

var p = Server.prototype;

p.start = function(cb) {
  this._app.listen(config.cas.port, config.cas.host);
};

p._configureRoutes = function() {

  var app = this._app;

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'all your bases are belong to us !'
  }));

  // Serve vendor
  app.get('/vendor/*', this._serveVendor.bind(this));

  // Login
  app.get('/login', this._redirectIfLoggedIn.bind(this), this._showLoginForm.bind(this));

  app.post('/login', this._handleLoginForm.bind(this));

  // Logout
  app.get('/logout', this._handleLogout.bind(this));

  // Service Ticket validation
  app.get('/serviceValidate', this._handleSTValidation.bind(this));
  app.get('/validate', this._handleSTValidation.bind(this));
  app.get('/p3/serviceValidate', this._handleSTValidation.bind(this));

};

p._redirectIfLoggedIn = function(req, res, next) {
  var service = req.query.service;

  if(service && req.session.userId) {
    var parsedUrl = url.parse(service, true);
    parsedUrl.query.ticket = this._getServiceTicket(service, userId);
    return res.redirect(url.format(parsedUrl));
  }

  return next();

};

p._showLoginForm = function(req, res) {
  var loginView = path.join(__dirname, 'views', 'login.html');
  return res.sendFile(loginView);
};

p._handleLoginForm = function(req, res) {

  var login = req.body.login;
  var password = req.body.password;

  return res.end();

};

p._handleSTValidation = function(req, res) {

  var service = req.query.service;

  if(!service) return res.status(400).end();




};

p._handleLogout = function(req, res) {

  req.session.destroy(function(err) {

    if(err) {
      console.error(err);
      return res.status(500).end();
    }

    var logoutView = path.join(__dirname, 'views', 'logout.html');
    return res.sendFile(logoutView);

  });

};

p._serveVendor = function(req, res) {
  return res.sendFile(
    req.params[0],
    { root: path.join(__dirname, '../../../..', 'node_modules') },
    function(err) {
      if(err) {
        res.status(404).end();
      }
      res.end();
    }
  );
};

p._getServiceTicket = function(service, userId) {
  var tickets = this._tickets[service] = this._tickets[service] || {};
  return (tickets[userId] = tickets[userId] || 'ST-'+Date.now()+(Math.random()*10000));
};

p.findUser = function(userId, cb) {

  var userFile = path.join(config.dataDir, userId+'.json');

  fs.exists(userFile, function(exists) {

    if(!exists) {
      return cb(null, null);
    }

    fs.readFile(userFile, 'utf8', function(err, content) {

      if(err) return cb(err);

      try {
        var user = JSON.parse(content);
        return cb(null, user);
      } catch(err) {
        return cb(err);
      }

    });

  });

};

module.exports = Server;
