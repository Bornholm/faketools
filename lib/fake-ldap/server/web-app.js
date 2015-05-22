var express = require('express');
var readdirp = require('readdirp');
var es = require('event-stream');
var path = require('path');
var fs = require('fs');

var config = require('../../config').fakeLDAP;

function WebApp() {
  this._app = express();
  this._app.set('json spaces', 2);
  this._configureRoutes();
}

var p = WebApp.prototype;

p.start = function() {
  this._app.listen(config.web.port, config.web.host);
};

p._configureRoutes = function() {

  var app = this._app;

  app.get('/api/ldap', this._serveLDAPTrees.bind(this));
  app.get('/vendor/*', this._serveVendor.bind(this));
  app.get('/*', this._serveApp.bind(this));


};

p._serveLDAPTrees = function(req, res) {

  var tree = {};

  var ldapStream = readdirp({
    root: config.dataDir
  });

  ldapStream
    .pipe(es.map(function(entry, cb) {
      grow(entry.path, tree);
      return cb();
    }))
    .once('end', function() {
      return res.status(200).send(tree);
    })
    .once('error', function(err) {
      console.error(err);
      res.status(500).end();
      process.exit(1);
    })
  ;

  function grow(path, tree) {
    var branches = Array.isArray(path) ? path : path.split('/');
    var branch = branches[0];
    if(!branch) return tree;
    if(!(branch in tree)) tree[branch] = {};
    if(branches.length > 1) grow(branches.slice(1), tree[branch]);
    return tree;
  }

};

p._serveApp = function(req, res) {
  return res.sendFile(
    req.params[0] || 'index.html',
    { root: path.join(__dirname, '..', 'client') }
  );
};

p._serveVendor = function(req, res) {
  return res.sendFile(
    req.params[0],
    { root: path.join(__dirname, '../../..', 'node_modules') },
    function(err) {
      if(err) {
        res.status(404).end();
      }
      res.end();
    }
  );
};



module.exports = WebApp;
