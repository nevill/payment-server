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

classMethods.createSingle = function(attrs, done) {
  _.extend(attrs, {
    kind: constant.PAYMENT_TYPE.SINGLE,
  });

  attrs.amount = Number(attrs.amount);
  if (typeof attrs.receivers === 'string') {
    attrs.receivers = [attrs.receivers];
  }

  var err = null;
  if (_.isEmpty(attrs.receivers)) {
    err = new Error('Please sepecify at least One receiver');
  } else if (!attrs.amount) {
    err = new Error('Please specify a valid amount');
  } else if (_.isEmpty(attrs.callbackUrl)) {
    err = new Error('Please specify a callback url');
  }

  if (err) {
    done(err);
  } else {
    this.create(attrs, done);
  }
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

instanceMethods.composePayRequestData = function(options) {
  var receivers = [];

  var amount = this.amount;
  this.receivers.forEach(function(email) {
    receivers.push({
      email: email,
      amount: amount
    });
  });

  var data = _.defaults({
    receiverList: {
      receiver: receivers
    },
    senderEmail: this.senderEmail,
    memo: util.format(nconf.get('paypal:memoTemplate'), this.amount),
  }, options);

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
