var path = require('path');
module.exports = require('rc')('dev-toolbelt', {



  fakeSmtp: {

    dataDir: path.join(__dirname, '..', 'data', 'smtp'),

    web: {
      host: '0.0.0.0',
      port: 8080
    },

    smtp: {
      port: 2525,
      host: '0.0.0.0',
    }

  }

});
