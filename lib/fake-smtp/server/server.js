var SMTPServer = require('smtp-server').SMTPServer;
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

var config = require('../../config').fakeSMTP;

function Server() {

  this._smtp = new SMTPServer({
    disabledCommands: ['STARTTLS'],
    onRcptTo: this._onRcptTo.bind(this),
    onMailFrom: this._onMailFrom.bind(this),
    onData: this._onMailData.bind(this),
    onAuth: this._onAuth.bind(this)
  });

}

var p = Server.prototype;

p.start = function(cb) {
  this._smtp.listen(config.smtp.port, config.smtp.host);
};

p._onMailData = function(stream, session, cb) {

  var fileName = uuid.v4()+'.eml';
  var filePath = path.join(config.dataDir, fileName);

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
  return cb(null, {user: auth.username});
};

module.exports = Server;
