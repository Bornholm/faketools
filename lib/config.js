var path = require('path');
module.exports = require('rc')('dev-toolbelt', {

  web: {
    host: '0.0.0.0',
    port: 8080
  },

  smtp: {
    port: 2525,
    host: '0.0.0.0',
    dataDir: path.join(__dirname, '..', 'data', 'smtp')
  }

});
