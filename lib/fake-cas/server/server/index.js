/* jshint node:true */
var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var url = require('url');
var morgan = require('morgan')

var config = require('../../../config').fakeCAS;

function Server() {
  this._app = express();
  this._tickets = {};
  this._configureRoutes();
}

var p = Server.prototype;

p.start = function(cb) {
  https.createServer(config.cas.httpsOpts, this._app)
    .listen(config.cas.port, config.cas.host)
  ;
};

p._configureRoutes = function() {

  var app = this._app;

  app.use(morgan('combined'));
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
  app.get('/proxyValidate', this._handleSTValidation.bind(this));
  app.get('/serviceValidate', this._handleSTValidation.bind(this));
  app.get('/validate', this._handleSTValidation.bind(this));
  app.get('/p3/serviceValidate', this._handleSTValidation.bind(this));

};

p._redirectIfLoggedIn = function(req, res, next) {

  var service = req.query.service;

  if(service && req.session.userId) {
    var parsedUrl = url.parse(service, true);
    parsedUrl.query.ticket = this._getServiceTicket(service, req.session.userId);
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
  var service = req.query.service || '';

  this._findUser(login, function(err, user) {

    if(err) {
      console.error(err);
      return res.status(500).end();
    }

    if(!user || !(user.password && user.password === password)) {
      return res.redirect(303, '/login');
    }

    var ticket = this._getServiceTicket(service, login);

    var parsedUrl = url.parse(service, true);
    parsedUrl.query.ticket = ticket;

    req.session.userId = login;

    req.session.save(function(err) {

      if(err) {
        console.error(err);
        return res.status(500).end();
      }

      return res.redirect(303, url.format(parsedUrl));

    });

  }.bind(this));

};

p._handleSTValidation = function(req, res) {

  var service = req.query.service;
  var ticket = req.query.ticket;

  if(!service) return res.status(400).end();


  this._findUserForServiceTicket(service, ticket, function(err, user) {

    if(err) {
      console.error(err);
      return res.status(500).end();
    }

    if(!user) {
      var failure = this._getAuthenticationFailureXML(ticket);
      res.set('Content-Type', 'text/xml');
      return res.status(200).end(failure, 'utf8');
    } else {
      var success = this._getAuthenticationSuccessXML(user);
      res.set('Content-Type', 'text/xml');
      return res.status(200).end(success, 'utf8');
    }

  }.bind(this));

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

p._ticketExists = function(service, userId) {
  var t = this._tickets;
  return t[service] ? ( t[service][userId] ? true : false ) : false;
};

p._getServiceTicket = function(service, userId) {
  var tickets = this._tickets[service] = this._tickets[service] || {};
  return (tickets[userId] = tickets[userId] || 'ST-'+Math.floor(Date.now()+(Math.random()*1000)));
};

p._removeTicket = function(service, userId) {
  if( this._ticketExists(service, userId) ) {
    delete this._tickets[service][userId];
  }
};

p._findUserForServiceTicket = function(service, ticket, cb) {

  var tickets = this._tickets[service];

  if(tickets) {
    for(var userId in tickets) {
      if(tickets.hasOwnProperty(userId)) {
        if(tickets[userId] === ticket) {
          return this._findUser(userId, cb);
        }
      }
    }
  }

  return cb(null, null);

};

p._findUser = function(userId, cb) {

  var userFile = path.join(config.dataDir, userId+'.json');

  fs.exists(userFile, function(exists) {

    if(!exists) {
      return cb(null, null);
    }

    fs.readFile(userFile, 'utf8', function(err, content) {

      if(err) return cb(err);

      try {
        var user = JSON.parse(content);
        user.id = userId;
        return cb(null, user);
      } catch(err) {
        return cb(err);
      }

    });

  });

};

p._getAuthenticationSuccessXML = function(user) {

  var xml = '<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas">' +
   '<cas:authenticationSuccess>' +
    '<cas:user>' + user.id + '</cas:user>';

  if(user.attributes) {
    xml += '<cas:attributes>';
    Object.keys(user.attributes).forEach(function(key) {
      var value = user.attributes[key];
      xml += '<cas:' + key + '>' + value + '</cas:'+ key + '>';
    });
    xml += '</cas:attributes>';
  }

  xml += '<cas:proxyTicket>PT-1856392-b98xZrQN4p90ASrw96c8</cas:proxyTicket>';

  xml += '</cas:authenticationSuccess>' +
  '</cas:serviceResponse>';

  return xml;

};

p._getAuthenticationFailureXML = function() {

  var xml = '<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas">' +
   '<cas:authenticationFailure code="INVALID_TICKET">' +
      'Ticket ST-1856339-aA5Yuvrxzpv8Tau1cYQ7 not recognized`' +
    '</cas:authenticationFailure>' +
  '</cas:serviceResponse>';

  return xml;

};

module.exports = Server;
