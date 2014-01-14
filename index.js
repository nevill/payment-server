var express = require('express');
var https = require('https');

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
  var verify = function(params, callback) {
    var body = require('querystring').stringify(params);
    var options = {
      host: 'https://www.sandbox.paypal.com',
      method: 'POST',
      path: '/cgi-bin/webscr',
      headers: {'Content-Length': body.length}
    };

    var req = https.request(options, function(res) {
      var data = [];

      res.on('data', function(d) {
        data.push(d);
      });

      res.on('end', function() {
        callback(null, data.join(''));
      });
    });

    req.on('error', function(e) {
      callback(e);
    });

    req.write(body);
    req.end();
  };

  verify(req.body, function(err, resp) {
    if (err) {
      console.log('err in verify response ===>', err);
    }
    else {
      console.log('verify response ===>', resp);
    }
  });

  res.send(200);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on port', port);
});