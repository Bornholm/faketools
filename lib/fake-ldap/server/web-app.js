var express = require('express');
var readdirp = require('readdirp');
var es = require('event-stream');
var path = require('path');
var fs = require('fs');

var config = require('../../config').fakeLDAP;

function WebApp() {
  this._app = express();
  this._configureRoutes();
}

var p = WebApp.prototype;

p.start = function() {
  this._app.listen(config.web.port, config.web.host);
};

p._configureRoutes = function() {

  var app = this._app;



};

module.exports = WebApp;
