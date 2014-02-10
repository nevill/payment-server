var https = require('https');
var qs = require('querystring');
var url = require('url');
var _ = require('underscore');

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

var RequiredOptions = [
  'endpoint', 'userId', 'password', 'signature', 'applicationId'
];

var Paths = {
  execute: '/AdaptivePayments/ExecutePayment',
  preapproval: '/AdaptivePayments/Preapproval',
  pay: '/AdaptivePayments/Pay',
  paymentDetails: '/AdaptivePayments/PaymentDetails',
  preapprovalDetails: '/AdaptivePayments/PreapprovalDetails'
};

function Paypal(options) {
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

Paypal.prototype._httpsRequest = function(body, options, callback) {
  if (!_.isString(body)) {
    body = JSON.stringify(body);
  }

  options.method = options.method || 'POST';
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
};

/**
 * @param body {Object} parameters will be sent to payapl
 * @param apiPath {String} the path of API call
 * @param callback {Function} will receive {err, respObj}
 *   err {Error} the error info
 *   respbOj {Object} a hash contains {statusCode, body}
 **/
Paypal.prototype._remoteCall = function(body, apiPath, callback) {
  var options = {
    host: this.options.endpoint,
    headers: this.headers,
    path: apiPath
  };
  _.extend(body, this.defaultPayload);
  this._httpsRequest(body, options, function(err, respObj) {
    var body;
    if (!err) {
      body = JSON.parse(respObj.body);

      if (body.error && body.error[0]) {
        err = new Error(body.error[0].message);
      }
    }
    process.nextTick(function() {
      callback.call(null, err, body);
    });
  });
};

/**
 * To create a payment
 * reference: https://developer.paypal.com/webapps/developer/docs/classic/api/adaptive-payments/Pay_API_Operation/
 **/
Paypal.prototype.pay = function(options, callback) {
  var body = {
    feesPayer: 'EACHRECEIVER',
    currencyCode: 'USD',
  };
  _.extend(body, options);
  this._remoteCall(body, Paths.pay, callback);
};

/**
 * To send a preapproval request
 * reference: https://developer.paypal.com/webapps/developer/docs/classic/api/adaptive-payments/Preapproval_API_Operation/
 **/
Paypal.prototype.preapproval = function(options, callback) {
  var body = {
    currencyCode: 'USD'
  };
  _.extend(body, options);
  this._remoteCall(body, Paths.preapproval, callback);
};

Paypal.prototype.preapprovalDetails = function(key, callback) {
  this._remoteCall({
    preapprovalKey: key
  }, Paths.preapprovalDetails, callback);
};

Paypal.prototype.paymentDetails = function(key, callback) {
  this._remoteCall({
    payKey: key
  }, Paths.paymentDetails, callback);
};

Paypal.prototype.createCommandLink = function(params) {
  return url.format({
    protocol: 'https',
    host: this.options.host,
    query: params,
    pathname: '/cgi-bin/webscr'
  });
};

Paypal.prototype.verify = function(params, callback) {
  var body = qs.stringify(params);
  var options = {
    host: this.options.host,
    method: 'POST',
    path: '/cgi-bin/webscr?cmd=_notify-validate',
    headers: {
      'Content-Length': body.length
    }
  };

  this._httpsRequest(body, options, function(err, respObj) {
    if (err) {
      callback(err);
    } else {
      callback(null, respObj.body === 'VERIFIED');
    }
  });
};

module.exports = Paypal;
