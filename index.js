var express = require('express');
var busboy = require('connect-busboy');
var https = require('https');
var qs = require('querystring');
var loadConfig = require('./config');

var app = express();
loadConfig(app);

app.use(busboy({immediate: true}));

app.use(function(req, res, next) {
  req.body = req.body || {};
  req.busboy.on('field', function(key, val) {
    req.body[key] = val;
  });

  req.busboy.on('end', function() {
    console.log('body ===>', req.body);
    next();
  });
});

app.get('/', function(req, res) {
  res.send('hello, express.js');
});

app.post('/', function(req, res) {
  res.send(200);
});

app.post('/paypal/ipn', function(req, res) {

  var verify = function(params, callback) {
    var body = qs.stringify(params);
    var options = {
      host: app.get('paypal').host,
      method: 'POST',
      path: '/cgi-bin/webscr?cmd=_notify-validate',
      headers: {'Content-Length': body.length}
    };

    var httpReq = https.request(options, function(httpResp) {
      var data = [];

      httpResp.on('data', function(d) {
        data.push(d);
      });

      httpResp.on('end', function() {
        callback(null, data.join(''));
      });
    });

    httpReq.on('error', function(e) {
      callback(e);
    });

    httpReq.write(body);
    httpReq.end();
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
