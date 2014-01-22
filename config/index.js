var nconf = require('nconf');

var defaults = {
  database: {
    driver: 'mongodb',
    url: '' || process.env.MONGOLAB_URI,
    options: {}
  },
  paypal: {
    host: 'www.sandbox.paypal.com',
    userId: '' || process.env.PP_UID,
    password: '' || process.env.PP_PASSWORD,
    signature: '' || process.env.PP_SIGNATURE,
    applicationId: '' || process.env.PP_APP_ID,
  }
};

var config = {
  development: {
  },
  test: {
  },
  production: {
    paypal: {
      host: 'www.paypal.com',
    }
  }
};

module.exports = function() {
  var env = process.env.NODE_ENV || 'development';
  nconf.overrides(config[env]);
  nconf.defaults(defaults);
};
