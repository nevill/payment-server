var express = require('express');
var busboyParser = require('./middleware/busboyParser');

var loadConfig = require('./config');
var loadRoutes = require('./route');

var app = express();
loadConfig(app);

app.use(busboyParser({immediate: true}));

loadRoutes(app);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on port', port);
});
