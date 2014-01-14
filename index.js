var express = require('express');
var client = require('request');

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
  client.post({
    url: link,
    form: req.body
  }, function(err, paypalResp, body) {
    if (err) {
      res.json(500, err);
      console.log('err in verify response ===>', err);
    }
    else {
      console.log('verify response ===>', body);
    }
  });

  res.send(200);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on port', port);
});
