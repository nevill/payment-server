#!/usr/bin/env node

var async = require('async');
var util = require('util');
var url = require('url');

var nconf = require('../config');
var Paypal = require('../lib/paypal');
var Payment = require('../model').Payment;
var db = require('../database');

var debug = function() {};
if (process.env.NODE_DEBUG) {
  debug = function() {
    console.log('[Debug] %s', util.format.apply(util, arguments));
  };
}

var returnUrl = url.format({
  protocol: 'https',
  host: nconf.get('host'),
  pathname: '/paypal/success'
});

var cancelUrl = url.format({
  protocol: 'https',
  host: nconf.get('host'),
  pathname: '/paypal/cancel'
});

var paypalClient = new Paypal(nconf.get('paypal'));

function execute(payment, next) {
  debug('Execute payment: %s ...', payment.id);
  // prepare a payment request body
  var data = payment.composePayRequest();
  data.returnUrl = returnUrl;
  data.cancelUrl = cancelUrl;

  debug('Request with: %s', util.inspect(data, {
    depth: null
  }));

  async.waterfall([
    function(cb) {
      paypalClient.pay(data, function(err, body) {
        debug('Response from Paypal: %s', util.inspect(body, {
          depth: null
        }));
        cb(err, body);
      });
    },
    function(body, cb) {
      var invoice = {
        payKey: body.payKey,
        amount: payment.amount,
        receivers: payment.receivers
      };
      payment.execute(invoice, cb);
    }
  ], function(err) {
    if (err) {
      console.error(err.message);
    }
    // don't pass the err to `next`
    // we want other payments get executed
    process.nextTick(next);
  });
}

db.init(function() {
  async.waterfall([
    Payment.findDues.bind(Payment),
    function(payments, cb) {
      async.each(payments, execute, cb);
    }
  ], function(err) {
    if (err) {
      console.error(err.message);
    }
    db.disconnect();
  });
});
