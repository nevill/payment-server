#!/usr/bin/env node
var util = require('util');
var nopt = require('nopt');
var nconf = require('../config');
var Paypal = require('../lib/paypal');

var knownOpts = {
  'help': Boolean
};
var shorthands = {
  'h': ['--help']
};

var parsed = nopt(knownOpts, shorthands);
var remains = parsed.argv.remain;

if (parsed.help) {
  console.log(function() {/*
usage: cancel.js key

    key: a preapprovalKey
*/}.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]);
  return;
}

if (remains.length === 0) {
  console.error('You have to specify a key');
  return;
}
delete parsed.argv;

var key = remains.shift();

var paypalClient = new Paypal(nconf.get('paypal'));
paypalClient.cancelPreapproval(key, function(err, body) {
  if (err) {
    console.error(err.message);
  }
  else {
    console.log(util.inspect(body, {depth: null}));
  }
});
