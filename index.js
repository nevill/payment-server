var express = require('express');
var busboyParser = require('./middleware/busboyParser');

var loadConfig = require('./config');
var loadRoutes = require('./route');

loadConfig();

var app = express();
app.use(busboyParser({immediate: true}));
loadRoutes(app);

module.exports = app;
