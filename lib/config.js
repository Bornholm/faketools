var path = require('path');
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

  }

});