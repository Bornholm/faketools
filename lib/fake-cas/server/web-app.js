var express = require('express');
var readdirp = require('readdirp');
var es = require('event-stream');
var path = require('path');
var fs = require('fs');

var config = require('../../config').fakeCAS;

function WebApp() {
  this._app = express();
  this._configureRoutes();
}

var p = WebApp.prototype;

p.start = function(cb) {
  this._app.listen(config.web.port, config.web.host, function(err) {
    if(err) {
      console.error(err);
      if(typeof cb === 'function') return cb(err);
    }
    console.log('Web app listening on https://%s:%s', config.web.host, config.web.port);
    if(typeof cb === 'function') return cb();
  });
};

p._configureRoutes = function() {

  var app = this._app;



};

module.exports = WebApp;
