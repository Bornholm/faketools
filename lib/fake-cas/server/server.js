var express = require('express');
var fs = require('fs');
var path = require('path');
var readdirp = require('readdirp');
var es = require('event-stream');

var config = require('../../config').fakeCAS;

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

      if(err) {
        res.end();
        return self._handleError(err);
      }

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
  console.log('----------------------------------');

  var self = this;
  var filePath = this._dnToFilepath(req.dn);

  fs.exists(filePath, function(exists) {

    if(!exists) {
      return next(new ldapjs.NoSuchObjectError(parent.toString()));
    }

    fs.readFile(filePath, {encoding: 'utf8'}, function(err, content) {

      if(err) return self._handleError(err);

      var obj;

      try {
        obj = JSON.parse(content);
        req.changes.forEach(function(c) {
          switch(c.operation) {
            case 'delete':
              delete obj.attributes[c.modification.type];
              break;
            case 'add':
            case 'replace':
              obj.attributes[c.modification.type] = c.modification.vals;
          }
        });
      } catch(err) {
        res.end();
        return self._handleError(err);
      }

      fs.writeFile(filePath, JSON.stringify(obj, null, 2), function(err) {
        res.end();
        if(err) {
          return self._handleError(err);
        }
      });

    });

  });

};

p._handleSearch = function(req, res) {

  console.log('Search:');
  console.log('base object: ' + req.dn.toString());
  console.log('scope: ' + req.scope);
  console.log('filter: ' + req.filter.toString());
  console.log('----------------------------------');

  var self = this;
  var baseDir = this._dnToFilepath(req.dn);

  fs.exists(baseDir, function(exists) {

    if(!exists) {
      return res.end();
    }

    var fileStream = readdirp({
      root: baseDir
    });

    fileStream
      .pipe(es.map(function(file, cb) {

        var filePath = path.join(baseDir, file.path);

        fs.readFile(filePath, {encoding: 'utf8'}, function(err, content) {
          if(err) {
            res.end();
            return self._handleError(err);
          }
          return cb(null, content);
        });

      }))
      .pipe(es.parse())
      .on('data', function(obj) {
        if( req.filter.matches(obj.attributes) ) {
          console.log('Found:');
          console.log('DN: ', obj.dn);
          console.log('Entry attributes: ', obj.attributes);
          console.log('----------------------------------');
          res.send(obj);
        }
      })
      .once('end', function() {
        return res.end();
      })
      .once('error', function(err) {
        res.end();
        return self._handleError(err);
      })
    ;

  });

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
