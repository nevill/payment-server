var async = require('async');
var util = require('util');

var validateAction = function(action) {
  var validActions = ['preapproval', 'pay', 'execute'];
  return validActions.indexOf(action) > -1;
};

var validateIPNStatus = function(action, status) {
  return (action === 'pay' && status === 'COMPLETED') ||
    (action === 'preapproval' && status === 'ACTIVE');
};

var sendWebhook = function(ironWorker, next) {
  return function(err, payment) {
    if (err) {
      next(err);
    } else {
      ironWorker.enqueue(payment.composeWebhook(), next);
    }
  };
};

exports.ipn = function(req, res) {
  var paypalClient = this.app.get('paypalClient');
  var ironWorker = this.app.get('ironWorker');
  var Payment = this.model.Payment;

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
      var action = req.param('action');
      var status = req.param('status');

      var err;
      // paypal can send several IPN messages on responsing one event
      if (validateAction(action)) {
        var method;
        var hasWebhook = false;

        if (action === 'execute') {
          // send webhook when executing a recurring payment
          hasWebhook = true;
          // A simple wrapper method
          method = function(paymentId, data, next) {
            return this.findById(paymentId, next);
          };
        } else if (validateIPNStatus(action, status)) {
          if (action === 'preapproval') {
            method = Payment.authorize;
          } else if (action === 'pay') {
            // send webhook when receiving a single payment
            hasWebhook = true;
            method = Payment.executeSingle;
          }
        } else {
          err = new Error('Invalid IPN status');
        }

        if (method) {
          var paymentId = req.param('id');
          var senderEmail = req.param('sender_email');

          if (hasWebhook) {
            next = sendWebhook(ironWorker, next);
          }

          next = method.bind(Payment, paymentId, {
            senderEmail: senderEmail,
            status: status,
          }, next);
        }
      }

      next(err);
    },
  ], function(err) {
    if (err) {
      //TODO log the error response
      console.log('Error occurred in POST /paypal/ipn:', err.message);
      console.log('Query: %s, body: %s', util.inspect(req.query, {
        depth: null
      }), util.inspect(req.body, {
        depth: null
      }));
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
