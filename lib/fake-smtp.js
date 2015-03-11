var EventEmitter = require('events').EventEmitter;
var util = require('util');
var SMTPServer = require('smtp-server').SMTPServer;
var MailParser = require('mailparser').MailParser;
var express = require('express');
var readdirp = require('readdirp');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

var config = require('./config');

function FakeSMTP() {

  this.web = express();

  this.web.get('/emails/:email/:attachment', this._downloadAttachment.bind(this));
  this.web.get('/emails', this._listEmails.bind(this));

  this.smtp = new SMTPServer({
    disabledCommands: ['STARTTLS'],
    onRcptTo: this._onRcptTo.bind(this),
    onMailFrom: this._onMailFrom.bind(this),
    onData: this._onMailData.bind(this),
    onAuth: this._onAuth.bind(this)
  });

}

util.inherits(FakeSMTP, EventEmitter);

var p = FakeSMTP.prototype;

p.start = function() {
  var self = this;
  this.smtp.listen(config.smtp.port, config.smtp.host);
  this.web.listen(config.web.port, config.web.host);
};

p.error = function() {
  this._log('ERROR', arguments);
};

p.info = function() {
  this._log('INFO', arguments);
};

p._listEmails = function(req, res) {

  var emails = [];

  var emailsStream = readdirp({
    root: config.smtp.dataDir,
    fileFilter: '*.eml'
  });

  emailsStream
    .pipe(es.map(function(entry, cb) {
      var filePath = path.join(config.smtp.dataDir, entry.path);
      var fileStream = fs.createReadStream(filePath);
      var parser = new MailParser({streamAttachments: true});
      fileStream.pipe(parser);
      parser.once('end', function(mail) {
        mail.uuid = path.basename(entry.path, '.eml');
        return cb(null, mail);
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

p._downloadAttachment = function(req, res) {

};

p._onMailData = function(stream, session, cb) {

  var fileName = uuid.v4()+'.eml';
  var filePath = path.join(config.smtp.dataDir, fileName);

  stream.pipe(fs.createWriteStream(filePath));

  stream.once('end', cb);

};

p._onMailFrom = function(address, session, cb) {
  return cb();
};

p._onRcptTo = function(address, session, cb) {
  return cb();
};

p._onAuth = function(auth, session, cb) {
  console.log(auth);
  return cb(null, {user: auth.username});
};

p._log = function(level) {
  args = Array.prototype.slice.call(arguments, 1);
  level = '['+level+']';
  console.log.apply(console, ['[FakeSMTP]', new Date(), level].concat(args));
};

module.exports = FakeSMTP;
