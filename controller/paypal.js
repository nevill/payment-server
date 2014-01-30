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
        link: link,
        preapprovalKey: body.preapprovalKey
      });
    }
  });
};

exports.pay = function(req, res) {
  var Payment = this.model.Payment;
  var paypalClient = this.app.get('paypalClient');

  async.waterfall([
    function(next) {
      Payment.create(req.body, next);
    },
    function(payment, next) {
      //TODO replace requestObj with payment.composePayRequestData
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

      paypalClient.pay(requestObj, next);
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
