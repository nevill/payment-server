var https = require('https');
var qs = require('querystring');
var nconf = require('nconf');

exports.ipn = function(req, res) {
  var verify = function(params, callback) {
    var body = qs.stringify(params);

    var options = {
      host: nconf.get('paypal:host'),
      method: 'POST',
      path: '/cgi-bin/webscr?cmd=_notify-validate',
      headers: {
        'Content-Length': body.length
      }
    };

    var httpReq = https.request(options, function(httpResp) {
      var data = [];

      httpResp.on('data', function(d) {
        data.push(d);
      });

      httpResp.on('end', function() {
        callback(null, data.join(''));
      });
    });

    httpReq.on('error', function(e) {
      callback(e);
    });

    httpReq.write(body);
    httpReq.end();
  };

  verify(req.body, function(err, resp) {
    if (err) {
      //TODO log the error response
      console.log('err in verify response ===>', err);
    } else {
      console.log('verify response ===>', resp);
    }
  });

  res.send(200);
};

exports.preapproval = function(req, res) {
  var data = req.body;
  var requestObj = {
    startingDate: data.startingDate,
    endingDate: data.endingDate,
    period: data.period,
    maxAmountPerPayment: data.maxAmountPerPayment,
    maxTotalAmountOfAllPayments: data.maxTotalAmountOfAllPayments,
    returnUrl: data.returnUrl,
    cancelUrl: data.cancelUrl,
    ipnNotificationUrl: data.ipnNotificationUrl,
    memo: data.memo,
  };


  var paypalClient = this.app.get('paypalClient');
  paypalClient.preapproval(requestObj, function(err, body) {
    if (err) {
      //TODO use a middleware to response the error
      res.json({
        error: err.message
      });
    } else {
      var link = paypalClient.createCommandLink({
        cmd: '_ap-preapproval',
        preapprovalkey: body.preapprovalKey
      });
      res.json({
        link: link
      });
    }
  });
};

exports.pay = function(req, res) {
  var data = req.body;
  var requestObj = {
    receiverList: {
      receiver: [{
        email: data.receiver,
        amount: data.amount
      }]
    },
    actionType: 'CREATE',
    returnUrl: data.returnUrl,
    cancelUrl: data.cancelUrl,
    ipnNotificationUrl: data.ipnNotificationUrl,
    memo: data.memo,
  };

  var paypalClient = this.app.get('paypalClient');
  paypalClient.pay(requestObj, function(err, body) {
    if (err) {
      res.json({
        error: err.message
      });
    } else {
      var link = paypalClient.createCommandLink({
        cmd: '_ap-payment',
        paykey: body.payKey
      });
      res.json({
        link: link
      });
    }
  });
};
