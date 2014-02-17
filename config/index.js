var nconf = require('nconf');

var defaults = {
  protocol: process.env.ENABLE_HTTPS ? 'https' : 'http',
  host: process.env.HOST_NAME || 'localhost:3000',
  database: {
    driver: 'mongodb',
    url: '' || process.env.MONGOLAB_URI,
    options: {}
  },
  paypal: {
    host: 'www.sandbox.paypal.com',
    endpoint: 'svcs.sandbox.paypal.com',
    userId: '' || process.env.PP_UID,
    password: '' || process.env.PP_PASSWORD,
    signature: '' || process.env.PP_SIGNATURE,
    applicationId: '' || process.env.PP_APP_ID,
    // message used in API call /Pay, will replace %d with the amount
    memoTemplate: 'Pay %d via Example.com',
  },
  iron: { // settings for iron workerh, see http://dev.iron.io/worker/
    projectId: '' || process.env.IRON_WORKER_PROJECT_ID,
    token: '' || process.env.IRON_WORKER_TOKEN,
    endpoint: 'worker-aws-us-east-1.iron.io',
    workers: {
      webhook: 'NotificationWorker'
    }
  }
};

var config = {
  development: {
    database: {
      url: process.env.MONGOLAB_URI || 'mongodb://localhost/paymentServer-dev',
    },
    paypal: {
      applicationId: 'APP-80W284485P519543T',
    },
    iron: {
      projectId: '',
      token: '',
    }
  },
  test: {
    database: {
      url: process.env.WERCKER_MONGODB_HOST || 'mongodb://localhost/paymentServer-test',
    },
  },
  production: {
    // always using https in production
    protocol: 'https',
    paypal: {
      host: 'www.paypal.com',
      endpoint: 'svcs.paypal.com'
    }
  }
};

var env = process.env.NODE_ENV || 'development';
nconf.overrides(config[env]);
nconf.defaults(defaults);

module.exports = nconf;
