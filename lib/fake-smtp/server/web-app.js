var express = require('express');
var readdirp = require('readdirp');
var es = require('event-stream');
var MailParser = require('mailparser').MailParser;
var path = require('path');
var fs = require('fs');

var config = require('../../config').fakeSMTP;

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
    console.log('Web app listening on http://%s:%s', config.web.host, config.web.port);
    if(typeof cb === 'function') return cb();
  });
};

p._configureRoutes = function() {

  var app = this._app;

  app.get('/vendor/*', this._serveVendor.bind(this));
  app.get('/api/emails/:uuid/:attachmentId', this._serveEmailAttachment.bind(this));
  app.get('/api/emails/:uuid', this._serveEmail.bind(this));
  app.get('/api/emails', this._serveEmails.bind(this));
  app.delete('/api/emails', this._clearEmails.bind(this));
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
    { root: path.join(__dirname, '../../..', 'node_modules') },
    function(err) {
      if(err) {
        res.status(404).end();
      }
      res.end();
    }
  );
};

p._serveEmails = function(req, res) {

  var emails = [];

  var emailsStream = readdirp({
    root: config.dataDir,
    fileFilter: '*.eml'
  });

  emailsStream
    .pipe(es.map(function(entry, cb) {

      var filePath = path.join(config.dataDir, entry.path);
      var fileStream = fs.createReadStream(filePath);
      var parser = new MailParser({streamAttachments: true});
      fileStream.pipe(parser);

      parser.once('end', function(mail) {
        return cb(null, {
          uuid: path.basename(entry.path, '.eml'),
          subject: mail.subject,
          headers: mail.headers,
          date: new Date(mail.headers.date),
          from: (mail.from || []).map(function(emitter) { return emitter.address; }),
          to: (mail.to || []).map(function(recipient) { return recipient.address; })
        });
      });

    }))
    .on('data', function(mail) {
      emails.push(mail);
    })
    .once('close', function() {
      emails.sort(function(e1, e2) {
        return e1.date < e2.date;
      });
      res.send(emails);
    })
  ;

};

p._serveEmail = function(req, res) {

  var uuid = req.params.uuid;
  var mailStream = this._getEmailStream(uuid);

  mailStream.once('error', function(err) {
    if(err.code ===  'ENOENT') {
      return res.status(404).end();
    } else {
      console.error(err.stack);
      res.status(500).end();
      process.exit(1);
    }
  });

  mailStream.once('end', function(email) {

    // Transformations des pièces jointes en URL
    if(email.attachments) {
      email.attachments.forEach(function(attachment) {
        delete attachment.stream;
      });
    }

    email.uuid = uuid;

    // Envoi de l'email sous sa forme JSON
    return res.send(email);

  });

};

p._serveEmailAttachment = function(req, res) {

  var uuid = req.params.uuid;
  var attachmentId = req.params.attachmentId;
  var mailStream = this._getEmailStream(uuid);
  var attachmentSent = false;
  var attachmentCount = 0;

  mailStream.on('attachment', function(attachment) {
    if(attachmentId == attachmentCount) {
      attachmentSent = true;
      res.set('Content-Type', attachment.contentType);
      return attachment.stream.pipe(res);
    }
    attachmentCount++;
  });

  mailStream.once('error', function(err) {
    if(err.code ===  'ENOENT') {
      return res.status(404).end();
    } else {
      console.error(err.stack);
      res.status(500).end();
      process.exit(1);
    }
  });

  mailStream.once('end', function() {
    if(!attachmentSent) {
      return res.status(404).end();
    }
  });

};


p._clearEmails = function(req, res) {

  var emailsStream = readdirp({
    root: config.dataDir,
    fileFilter: '*.eml'
  });

  emailsStream
    .pipe(es.map(function(entry, cb) {
      var filePath = path.join(config.dataDir, entry.path);
      fs.unlink(filePath, cb);
    }))
    .once('end', function() {
      res.status(204).end();
    })
  ;

};

p._getEmailPath = function(uuid) {
  return path.join(config.dataDir, uuid+'.eml');
};

p._getEmailStream = function(uuid) {

  var filePath = this._getEmailPath(uuid);
  var parser = new MailParser({streamAttachments: true});
  var fileStream = fs.createReadStream(filePath);

  fileStream.pipe(parser);

  return parser;

};

module.exports = WebApp;
