var https = require('https');
var _ = require('underscore');

var WebCommandPrefix = 'https://www.sandbox.paypal.com/cgi-bin/webscr';
var Endpoint = 'svcs.sandbox.paypal.com';

function hasRequiredKeys(object, keyNames) {
  var missedKeys = keyNames.reduce(function(missedKeys, key) {
    if (!_.has(object, key)) { // not found
      missedKeys.push(key);
    }
    return missedKeys;
  }, []);

  if (missedKeys.length > 0) {
    throw new Error(
      'Missing required parameter: ' + missedKeys.join(',')
    );
  }
  return true;
}

function httpsRequest(body, options, callback) {
  if (!_.isString(body)) {
    body = JSON.stringify(body);
  }
  options.method = options.method || 'POST';
  options.path = options.path;
  options.headers['Content-Length'] = body.length;

  //TODO verify SSL certificate
  var httpReq = https.request(options, function(httpResp) {
    var data = [];

    httpResp.on('data', function(d) {
      data.push(d);
    });

    httpResp.on('end', function() {
      callback(null, {
        statusCode: httpResp.statusCode,
        body: data.join('')
      }, httpResp);
    });
  });

  httpReq.on('error', function(e) {
    callback(e);
  });

  httpReq.write(body);
  httpReq.end();
}

var RequiredOptions = [
  'userId', 'password', 'signature', 'applicationId'
];

var Paths = {
  execute: '/AdaptivePayments/ExecutePayment',
  preapproval: '/AdaptivePayments/Preapproval',
  pay: '/AdaptivePayments/Pay',
  paymentDetails: '/AdaptivePayments/PaymentDetails',
  preapprovalDetails: '/AdaptivePayments/PreapprovalDetails'
};

function Paypal(options, isProduction) {
  if (isProduction || process.env.NODE_ENV === 'production') {
    WebCommandPrefix = 'https://www.paypal.com/cgi-bin/webscr';
    Endpoint = 'svcs.paypal.com';
  }

  hasRequiredKeys(options, RequiredOptions);
  this.headers = {
    'X-PAYPAL-SECURITY-USERID': options.userId,
    'X-PAYPAL-SECURITY-PASSWORD': options.password,
    'X-PAYPAL-SECURITY-SIGNATURE': options.signature,
    'X-PAYPAL-REQUEST-DATA-FORMAT': 'JSON',
    'X-PAYPAL-RESPONSE-DATA-FORMAT': 'JSON',
    'X-PAYPAL-APPLICATION-ID': options.applicationId
  };
  this.defaultPayload = {
    requestEnvelope: {
      errorLanguage: 'en_US'
    }
  };
  this.options = options;
}

/**
  * @param body {Object} parameters will be sent to payapl
  * @param apiPath {String} the path of API call
  * @param callback {Function} will receive {err, respObj, res}
  *   err {Error} the error info
  *   respbOj {Object} contains {statusCode, body} body is a string represented response content
  *   res {Object} an instance of HttpResponse
  *
  **/
Paypal.prototype.remoteCall = function(body, apiPath, callback) {
  var options = {
    host: Endpoint,
    headers: this.headers,
    path: apiPath
  };
  _.extend(body, this.defaultPayload);
  httpsRequest(body, options, function(err, respObj, res) {
    var body;
    if (!err) {
      body = JSON.parse(respObj.body);

      if (body.error && body.error[0]) {
        err = new Error(body.error[0].message);
      }
    }
    process.nextTick(function() {
      callback.call(null, err, body, res);
    });
  });
};

Paypal.prototype.pay = function(options, callback) {
  var body = {
    feesPayer: 'EACHRECEIVER',
    currencyCode: 'USD',
  };
  _.extend(body, options);
  this.remoteCall(body, Paths.pay, callback);
};

Paypal.prototype.preapprovalDetails = function(key, callback) {
  this.remoteCall({
    preapprovalKey: key
  }, Paths.preapprovalDetails, callback);
};

Paypal.prototype.paymentDetails = function(key, callback) {
  this.remoteCall({
    payKey: key
  }, Paths.paymentDetails, callback);
};

module.exports = Paypal;
