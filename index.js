var express = require('express');
var busboyParser = require('./middleware/busboyParser');
var loadRoutes = require('./route');
require('./config');

var app = express();
app.use(busboyParser({immediate: true}));
loadRoutes(app);

module.exports = app;
