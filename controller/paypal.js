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
