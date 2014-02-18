var url = require('url');
var util = require('util');
var nconf = require('nconf');
var moment = require('moment');
var _ = require('underscore');
var constant = require('../constant');

var periodMap = {
  DAILY: 'days',
  WEEKLY: 'weeks',
  MONTHLY: 'months',
  ANNUALLY: 'years'
};

function plus(num1, num2) {
  return Math.round((num1 + num2) * 100) / 100;
}

function multiply(num1, num2) {
  return Math.round(num1 * num2 * 100) / 100;
}

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
    err = new Error('Please sepecify at least one receiver');
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

classMethods.createRecurring = function(attrs, done) {
  _.extend(attrs, {
    kind: constant.PAYMENT_TYPE.RECURRING
  });

  attrs.amount = Number(attrs.amount);
  attrs.startingAt = attrs.startingAt;
  attrs.endingAt = attrs.endingAt;
  if (typeof attrs.receivers === 'string') {
    attrs.receivers = [attrs.receivers];
  }

  var err = null;
  if (_.isEmpty(attrs.receivers)) {
    err = new Error('Please sepecify at least one receiver');
  } else if (!attrs.amount) {
    err = new Error('Please specify a valid amount');
  } else if (_.isEmpty(attrs.callbackUrl)) {
    err = new Error('Please specify a callback url');
  } else if (!attrs.startingAt) {
    err = new Error('Please specify a valid startingAt date');
  } else if (!attrs.endingAt) {
    err = new Error('Please specify a valid endingAt date');
  }

  if (err) {
    done(err);
  } else {
    this.create(attrs, done);
  }
};

// Update payment info when answering a single payment IPN message
classMethods.executeSingle = function(id, data, done) {
  this.findOne({
    _id: id,
    kind: constant.PAYMENT_TYPE.SINGLE
  }, function(err, payment) {
    if (err) {
      done(err);
    } else {
      payment.set(data);
      payment.save(done);
    }
  });
};

// Update payment info when answering a preapproval authorized IPN message
classMethods.authorize = function(id, data, done) {
  this.findOne({
    _id: id,
    kind: constant.PAYMENT_TYPE.RECURRING
  }, function(err, payment) {
    if (err) {
      done(err);
    } else {
      payment.set(data);
      payment.save(done);
    }
  });
};

var instanceMethods = {};
// Execute a recurring payment
instanceMethods.execute = function(data, done) {
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
};

instanceMethods.composePayRequest = function(options) {
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
    // we can think of set IPN url here if needed.
    // currently we don't need to. Because when execute a recurring
    // payment, task/execute.js can handle it.
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
        id: this.id,
        action: 'pay'
      },
    };

    _.extend(data, {
      actionType: 'CREATE',
      ipnNotificationUrl: url.format(urlObj),
    });
  }
  return data;
};

instanceMethods._calculateTotalAmount = function() {
  return multiply(
    moment(this.endingAt).diff(this.startingAt, periodMap[this.period]),
    this.amount);
};

instanceMethods.composePreapprovalRequest = function(options) {
  var urlObj = {
    host: nconf.get('host'),
    protocol: nconf.get('protocol'),
    pathname: '/paypal/ipn',
    query: {
      id: this.id,
      action: 'preapproval'
    },
  };

  return _.defaults({
    startingDate: this.startingAt,
    endingDate: this.endingAt,
    period: this.period,
    maxAmountPerPayment: this.amount,
    maxTotalAmountOfAllPayments: this._calculateTotalAmount(),
    ipnNotificationUrl: url.format(urlObj),
  }, options);
};

instanceMethods.composeWebhook = function() {
  return {
    url: this.callbackUrl,
    body: {
      id: this.id,
      amount: this.amount,
    }
  };
};

module.exports = function(schema) {
  schema.static(classMethods);
  schema.method(instanceMethods);

  // set attribute nextBilling
  schema.pre('save', true, function(next, done) {
    next();
    if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
      var period = periodMap[this.period];
      if (this.isNew) {
        this.nextBilling = moment(this.startingAt).add(period, 1);
      } else {
        this.nextBilling = moment(this.lastBilling).add(period, 1);
      }
    }
    done();
  });
};
