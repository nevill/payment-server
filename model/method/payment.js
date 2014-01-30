var url = require('url');
var util = require('util');
var nconf = require('nconf');
var _ = require('underscore');
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

function plus(num1, num2) {
  return Math.round((num1 + num2) * 100) / 100;
}

var instanceMethods = {};
// Execute a recurring payment
instanceMethods.execute = function(data, done) {
  if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
    this.accruedAmount = plus(this.accruedAmount || 0, data.amount);
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

  var amount = this.amount;
  this.receivers.forEach(function(email) {
    receivers.push({
      email: email,
      amount: amount
    });
  });

  var data = {
    receiverList: {
      receiver: receivers
    },
    senderEmail: this.senderEmail,
    memo: util.format(nconf.get('paypal:memoTemplate'), this.amount),
  };

  if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
    _.extend(data, {
      actionType: 'PAY',
      preapprovalKey: this.key
    });
  } else if (this.kind === constant.PAYMENT_TYPE.SINGLE) {
    var urlObj = {
      host: nconf.get('host'),
      protocol: nconf.get('protocol'),
      pathname: '/paypal/ipn',
      query: {
        id: this.id
      },
    };

    _.extend(data, {
      actionType: 'CREATE',
      ipnNotificationUrl: url.format(urlObj),
    });
  }
  return data;
};

module.exports = function(schema) {
  schema.static(classMethods);
  schema.method(instanceMethods);
};
