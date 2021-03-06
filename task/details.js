#!/usr/bin/env node
var util = require('util');
var nopt = require('nopt');
var nconf = require('../config');
var Paypal = require('../lib/paypal');

var knownOpts = {
  'type': ['pre', 'pay'],
  'help': Boolean
};
var shorthands = {
  't': ['--type'],
  'h': ['--help']
};

var parsed = nopt(knownOpts, shorthands);
var remains = parsed.argv.remain;

if (parsed.help) {
  console.log(function() {/*
usage: details.js [--type pre] key

    --type {pre, pay}: default is `pay`, will get payment details
    key: a payKey or preapprovalKey
*/}.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]);
  return;
}

if (remains.length === 0) {
  console.error('You have to specify a key');
  return;
}
delete parsed.argv;

var paypalClient = new Paypal(nconf.get('paypal'));
var key = remains.shift();

var callMethod = paypalClient.paymentDetails;
if (parsed.type === 'pre') {
  callMethod = paypalClient.preapprovalDetails;
}

callMethod.call(paypalClient, key, function(err, body) {
  if (err) {
    console.error(err.message);
  }
  else {
    console.log(util.inspect(body, {depth: null}));
  }
});
