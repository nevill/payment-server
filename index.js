var express = require('express');
var nconf = require('./config');
var busboyParser = require('./middleware/busboyParser');

var app = express();
app.use(busboyParser({immediate: true}));

var context = {
  app: app,
  model: require('./model'),
};
require('./route')(app, context);

module.exports = app;
