var async = require('async');

exports.ipn = function(req, res) {
  var paypalClient = this.app.get('paypalClient');
  paypalClient.verify(req.body, function(err) {
    if (err) {
      //TODO log the error response
      console.log('err in verify response ===>', err);
    }
  });

  res.send(200);
};

exports.preapproval = function(req, res) {
  var data = req.body;
  var Payment = this.model.Payment;
  var paypalClient = this.app.get('paypalClient');

  async.waterfall([
    function(next) {
      Payment.createRecurring(req.body, next);
    },
    function(payment, next) {
      paypalClient.preapproval(
        payment.composePreapprovalRequest({
          returnUrl: data.returnUrl,
          cancelUrl: data.cancelUrl,
        }), function(err, body) {
          payment.key = body.preapprovalKey;
          next(err, payment);
        });
    },
    function(payment, next) {
      payment.save(function(err, payment) {
        next(err, payment);
      });
    },
    function(payment, next) {
      var link = paypalClient.createCommandLink({
        cmd: '_ap-preapproval',
        preapprovalkey: payment.key
      });
      next(null, {
        link: link,
        preapprovalKey: payment.key
      });
    },
  ], function(err, respBody) {
    if (err) {
      res.json({
        error: err.message
      });
    } else {
      res.json(respBody);
    }
  });
};

/**
 *  Do a single payment
 *  Required params: Payment Object + returnUrl + cancelUrl
 */
exports.pay = function(req, res) {
  var Payment = this.model.Payment;
  var paypalClient = this.app.get('paypalClient');

  async.waterfall([
    function(next) {
      Payment.createSingle(req.body, next);
    },
    function(payment, next) {
      var data = req.body;
      paypalClient.pay(
        payment.composePayRequest({
          returnUrl: data.returnUrl,
          cancelUrl: data.cancelUrl,
        }), next);
    },
    function(body, next) {
      var link = paypalClient.createCommandLink({
        cmd: '_ap-payment',
        paykey: body.payKey
      });
      next(null, {
        link: link,
        payKey: body.payKey
      });
    },
  ], function(err, respBody) {
    if (err) {
      res.json({
        error: err.message
      });
    } else {
      res.json(respBody);
    }
  });
};
