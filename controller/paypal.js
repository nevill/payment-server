var async = require('async');

exports.ipn = function(req, res) {
  var paypalClient = this.app.get('paypalClient');
  var Payment = this.model.Payment;
  var constant = this.model.constants;

  var paymentId = req.param('id');
  // action is one of ['preapproval', 'pay', 'execute']
  var action = req.param('action');

  async.waterfall([
    function(next) {
      paypalClient.verify(req.body, next);
    },
    function(result, next) {
      var err;
      if (!result) {
        err = new Error('Unable to validate IPN');
      }
      next(err);
    },
    function(next) {
      var query = {
        _id: paymentId
      };
      if (action === 'preapproval') {
        query.kind = constant.PAYMENT_TYPE.RECURRING;
      }
      Payment.findOne(query, next);
    },
    function(payment, next) {
      if (action === 'preapproval') {
        payment.senderEmail = req.param('sender_email');
        payment.status = constant.PAYMENT_STATUS.ACTIVE;
        payment.save(next);
      }
      else {
        next();
      }
    }
  ], function(err) {
    if (err) {
      //TODO log the error response
      console.log('Error occurred in POST /paypal/ipn:', err);
      console.log('Query: %s, body: %s', req.query, req.body);
    }
    res.send(200);
  });
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
          next(err, body.preapprovalKey, payment);
        });
    },
    function(preapprovalKey, payment, next) {
      payment.key = preapprovalKey;
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
        }), function(err, body) {
          next(err, body.payKey, payment);
        });
    },
    function(payKey, payment, next) {
      payment.key = payKey;
      payment.save(function(err, payment) {
        next(err, payment);
      });
    },
    function(payment, next) {
      var link = paypalClient.createCommandLink({
        cmd: '_ap-payment',
        paykey: payment.key
      });
      next(null, {
        link: link,
        payKey: payment.key
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
