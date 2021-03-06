var express = require('express');
var nconf = require('./config');
var busboyParser = require('./middleware/busboyParser');
var Paypal = require('./lib/paypal');
var Iron = require('./lib/iron');

var app = express();
app.use(busboyParser({immediate: true}));

app.set('paypalClient', new Paypal(nconf.get('paypal')));
app.set('ironWorker', new Iron(nconf.get('iron')));
var context = {
  app: app,
  model: require('./model'),
};
require('./route')(app, context);

module.exports = app;
