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

module.exports = function(app) {
  var env = process.NODE_ENV || 'development';
  Object.keys(config[env]).forEach(function(name) {
    app.set(name, config[env][name]);
  });
};
