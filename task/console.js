#!/usr/bin/env node

var repl = require('repl');
var db = require('../database');

db.init(function() {
  // start repl on stdin
  var context = repl.start({
    prompt: 'paymentServer> ',
  }).context;

  context.app = require('../index');
  context.model = require('../model');
});
