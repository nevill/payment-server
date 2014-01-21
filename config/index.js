var nconf = require('nconf');

var config = {
  development: {
    paypal: {
      host: 'www.sandbox.paypal.com'
    }
  },
  test: {
    paypal: {
      host: 'www.sandbox.paypal.com'
    }
  },
  production: {
    paypal: {
      host: 'www.paypal.com'
    }
  }
};

module.exports = function() {
  var env = process.NODE_ENV || 'development';
  nconf.defaults(config[env]);
};
