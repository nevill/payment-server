var util = require('util');
var nconf = require('nconf');
var constant = require('../constant');

var classMethods = {};
classMethods.findDues = function(done) {
  var now = new Date();
  this.find({
    kind: constant.PAYMENT_TYPE.RECURRING,
    nextBilling: {
      $lte: now,
    }
  }, done);
};

var instanceMethods = {};

// Execute a recurring payment
instanceMethods.execute = function(data, done) {
  if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
    this.accruedAmount += data.amount;
    var now = new Date();
    this.lastBilling = now;
    this.history.push({
      payKey: data.payKey,
      amount: data.amount,
      receivers: data.receivers,
      createdAt: now,
    });

    this.save(done);
  } else {
    done();
  }
};

instanceMethods.composePayRequestData = function() {
  var receivers = [];

  this.receivers.forEach(function(email) {
    receivers.push({
      email: email,
      amount: this.amount
    });
  });

  var data = {
    receiverList: {
      receiver: receivers
    },
    senderEmail: this.senderEmail,
    actionType: 'PAY',
    memo: util.format(nconf.get('paypal:memoTemplate'), this.amount),
  };

  if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
    data.preapprovalKey = this.key;
  }
  return data;
};

module.exports = function(schema) {
  schema.static(classMethods);
  schema.method(instanceMethods);
};
