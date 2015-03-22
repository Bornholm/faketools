var ldapjs = require('ldapjs');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var config = require('../../config').fakeLDAP;

function Server() {
  this._ldap = ldapjs.createServer();
  this._configureHandlers();
}

var p = Server.prototype;

p.start = function(cb) {
  this._ldap.listen(config.ldap.port, config.ldap.host, cb);
};

p._configureHandlers = function() {

  var ldap = this._ldap;
  var baseDN = config.ldap.baseDN;

  ldap.bind(baseDN, this._handleBind.bind(this));
  ldap.add(baseDN, this._handleAdd.bind(this));
  ldap.del(baseDN, this._handleDel.bind(this));
  ldap.modify(baseDN, this._handleModify.bind(this));
  ldap.search(baseDN, this._handleSearch.bind(this));
  ldap.modifyDN(baseDN, this._handleModifyDN.bind(this));

};

p._dnToFilepath = function(dn, cut) {

  if(typeof dn !== 'string') {
    dn = dn.toString();
  }

  var nodes = dn.split(',').reverse();
  var parts = [config.dataDir].concat(cut ? nodes.slice(0, -cut) : nodes);
  return path.join.apply(path, parts);
};

p._handleError = function(err) {
  console.error(err);
  return process.exit(1);
};

p._handleBind = function(req, res) {
  console.log('Bind:');
  console.log('bind DN: ', req.dn.toString());
  console.log('bind PW: ', req.credentials);
  res.end();
  console.log('----------------------------------');
};

p._handleAdd = function(req, res, next) {

  console.log('Add:');
  console.log('DN: ', req.dn.toString());
  console.log('Entry attributes: ', req.toObject().attributes);
  console.log('----------------------------------');

  var self = this;
  var filePath = self._dnToFilepath(req.dn);

  // On vérifie si le fichier associé à la fiche existe déjà
  fs.exists(filePath, function(exists) {

    // La fiche existe déjà
    if(exists) {
      return next(new ldapjs.EntryAlreadyExistsError(req.dn.toString()));
    }

    var fileDir = self._dnToFilepath(req.dn, 1);

    // On créait l'arborescence jusqu'au fichier
    mkdirp(fileDir, function(err) {

      if(err) return self._handleError(err);

      // On sauvegarde les attributs de la fiche LDAP dans le fichier associé
      // au format JSON
      var content = JSON.stringify({
        dn: req.dn.toString(),
        attributes: req.toObject().attributes
      }, null, 2);
      fs.writeFile(filePath, content, function(err) {
        if(err) return self._handleError(err);
        res.end();
      });

    });

  });

};

p._handleDel = function(req, res, next) {

  console.log('Delete:');
  console.log('DN: ', req.dn.toString());
  console.log('----------------------------------');

  var self = this;
  var filePath = self._dnToFilepath(req.dn);

  // On vérifie si le fichier associé existe
  fs.exists(filePath, function(exists) {

    if(!exists) {
      return next(new ldapjs.NoSuchObjectError(parent.toString()));
    }

    // Suppression du fichier
    fs.unlink(filePath, function(err) {
      if(err) return self._handleError(err);
      res.end();
    });

  });

};

p._handleModify = function(req, res) {
  console.log('Modify:');
  console.log('DN: ', req.dn.toString());
  console.log('changes:');
  req.changes.forEach(function(c) {
    console.log('  operation:', c.operation);
    console.log('  modification:', c.modification.toString());
  });
  res.end();
  console.log('----------------------------------');
};

p._handleSearch = function(req, res) {

  console.log('Search:');
  console.log('base object: ' + req.dn.toString());
  console.log('scope: ' + req.scope);
  console.log('filter: ' + req.filter.toString());

  if(req.filter.toString() === '(&(uid=usager_2206)(!(userpassword=*)))') {
    var obj = {
      dn: DN,
      attributes: {
        displayName: 'test'
      }
    };
    res.send(obj);
  }


  res.end();

  console.log('----------------------------------');
};

p._handleModifyDN = function(req, res) {
  console.log('DN: ' + req.dn.toString());
  console.log('new RDN: ' + req.newRdn.toString());
  console.log('deleteOldRDN: ' + req.deleteOldRdn);
  console.log('new superior: ' +
  (req.newSuperior ? req.newSuperior.toString() : ''));
  res.end();
  console.log('----------------------------------');
};

module.exports = Server;
