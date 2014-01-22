var nconf = require('nconf');

var config = {
  development: {
    paypal: {
      host: 'www.sandbox.paypal.com',
      userId: '' || process.env.PP_UID,
      password: '' || process.env.PP_PASSWORD,
      signature: '' || process.env.PP_SIGNATURE,
      applicationId: '' || process.env.PP_APP_ID,
    }
  },
  test: {
    paypal: {
      host: 'www.sandbox.paypal.com',
      userId: '' || process.env.PP_UID,
      password: '' || process.env.PP_PASSWORD,
      signature: '' || process.env.PP_SIGNATURE,
      applicationId: '' || process.env.PP_APP_ID,
    }
  },
  production: {
    paypal: {
      host: 'www.paypal.com',
      userId: '' || process.env.PP_UID,
      password: '' || process.env.PP_PASSWORD,
      signature: '' || process.env.PP_SIGNATURE,
      applicationId: '' || process.env.PP_APP_ID,
    }
  }
};

module.exports = function() {
  var env = process.NODE_ENV || 'development';
  nconf.defaults(config[env]);
};
