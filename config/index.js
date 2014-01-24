var nconf = require('nconf');

var defaults = {
  host: 'localhost:3000',
  database: {
    driver: 'mongodb',
    url: 'mongodb://localhost/paymentServer-dev',
    options: {}
  },
  paypal: {
    host: 'www.sandbox.paypal.com',
    userId: '' || process.env.PP_UID,
    password: '' || process.env.PP_PASSWORD,
    signature: '' || process.env.PP_SIGNATURE,
    applicationId: '' || process.env.PP_APP_ID,
    // message used in API call /Pay, will replace %d with the amount
    memoTemplate: 'Pay %d via Example.com',
  }
};

var config = {
  development: {
    paypal: {
      applicationId: 'APP-80W284485P519543T',
    }
  },
  test: {
    database: {
      url: 'mongodb://localhost/paymentServer-test',
    },
  },
  production: {
    database: {
      url: '' || process.env.MONGOLAB_URI,
    },
    paypal: {
      host: 'www.paypal.com',
    }
  }
};

var env = process.env.NODE_ENV || 'development';
nconf.overrides(config[env]);
nconf.defaults(defaults);

module.exports = nconf;
