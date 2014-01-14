var express = require('express');

var app = express();

app.use(express.logger('short'));
app.use(express.bodyParser());

app.use(function(req, res, next) {
  console.log('request content-type ===>', req.get('content-type'));
  console.log('body ===>', req.body);
  next();
});

app.get('/', function(req, res) {
  res.send('hello, express.js');
});

app.post('/paypal/ipn', function(req, res) {
  res.send(200);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on port', port);
});
