var path = require('path');
var fs = require('fs');

module.exports = require('rc')('faketools', {

  fakeSMTP: {

    dataDir: path.join(__dirname, '..', 'data', 'smtp'),

    web: {
      host: '0.0.0.0',
      port: 8080
    },

    smtp: {
      port: 2525,
      host: '0.0.0.0',
    },

    transferConfig: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: 'user@gmail.com',
        pass: 'pass'
      }
    }

  },

  fakeLDAP: {

    dataDir: path.join(__dirname, '..', 'data', 'ldap'),

    web: {
      host: '0.0.0.0',
      port: 8081
    },

    ldap: {
      port: 3389,
      host: '0.0.0.0',
      baseDN: 'o=test'
    }

  },

  fakeCAS: {

    dataDir: path.join(__dirname, '..', 'data', 'cas', 'users'),

    web: {
      host: '0.0.0.0',
      port: 8082
    },

    cas: {
      port: 8443,
      host: '0.0.0.0',
      httpsOpts: {
        keyPath: path.join(__dirname, '..', 'data', 'cas', 'fakecas-key.pem'),
        certPath: path.join(__dirname, '..', 'data', 'cas', 'fakecas-cert.pem')
      }
    }

  },

});
