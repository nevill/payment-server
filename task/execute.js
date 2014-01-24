#!/usr/bin/env node

var util = require('util');
var url = require('url');
var nconf = require('nconf');

var loadConfig = require('../config');
var Paypal = require('../lib/paypal');
var Payment = require('../model').Payment;

loadConfig();
var paypalClient = new Paypal(nconf.get('paypal'));

var debug = function() {};
if (process.env.NODE_DEBUG) {
  debug = function() {
    console.log('[Debug] %s', util.format.apply(util, arguments));
  };
}

Payment.findDues(function(err, payments) {
  if (err) {
    console.error(err.message);
  } else {
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

    payments.forEach(function(payment) {
      debug('Execute payment: %s ...', payment.id);
      // send a request to payment
      var data = payment.composePayRequestData();
      data.returnUrl = returnUrl;
      data.cancelUrl = cancelUrl;
      paypalClient.pay(data, function(err, body) {
        if (err) {
          console.error(err.message);
        } else {
          debug(util.inspect(body, {
            depth: null
          }));
          var invoice = {
            payKey: body.payKey,
            amount: payment.amount,
            receivers: payment.receivers
          };
          payment.execute(invoice, function(err) {
            if (err) {
              console.error(err.message);
            }
          });
        }
      });
    });
  }
});
