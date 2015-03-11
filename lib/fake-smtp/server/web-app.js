var express = require('express');
var readdirp = require('readdirp');
var es = require('event-stream');
var MailParser = require('mailparser').MailParser;
var path = require('path');
var fs = require('fs');

var config = require('../../config');

function WebApp() {
  this._app = express();
  this._configureRoutes();
}

var p = WebApp.prototype;

p.start = function() {
  this._app.listen(config.fakeSmtp.web.port, config.fakeSmtp.web.host);
};

p._configureRoutes = function() {

  var app = this._app;

  app.get('/vendor/*', this._serveVendor.bind(this));
  app.get('/api/emails/:uuid', this._serveEmail.bind(this));
  app.get('/api/emails', this._serveEmails.bind(this));
  app.get('/api/:uuid/:attachment', this._serveEmailAttachment.bind(this));
  app.get('/*', this._serveApp.bind(this));

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
    { root: path.join(__dirname, '../../..', 'node_modules') }
  );
};

p._serveEmails = function(req, res) {

  var emails = [];

  var emailsStream = readdirp({
    root: config.fakeSmtp.dataDir,
    fileFilter: '*.eml'
  });

  emailsStream
    .pipe(es.map(function(entry, cb) {
      var filePath = path.join(config.fakeSmtp.dataDir, entry.path);
      var fileStream = fs.createReadStream(filePath);
      var parser = new MailParser({streamAttachments: true});
      fileStream.pipe(parser);
      parser.once('end', function(mail) {
        return cb(null, {
          uuid: path.basename(entry.path, '.eml'),
          subject: mail.subject,
          date: new Date(mail.headers.date),
          from: mail.from.map(function(emitter) {return emitter.address; }),
          to: mail.to.map(function(emitter) {return emitter.address; })
        });
      });
    }))
    .on('data', function(mail) {
      emails.push(mail);
    })
    .once('close', function() {
      res.send(emails);
    })
  ;

};

p._serveEmail = function(req, res) {

  var uuid = req.params.uuid;
  var filePath = path.join(config.fakeSmtp.dataDir, uuid+'.eml');

  console.log(filePath);

  var fileStream = fs.createReadStream(filePath);

  var parser = new MailParser({streamAttachments: true});

  parser.once('end', function(email) {
    res.send(email);
  });

  fileStream.pipe(parser);

};

p._serveEmailAttachment = function(req, res) {

};

module.exports = WebApp;
