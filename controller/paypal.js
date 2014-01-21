var https = require('https');
var qs = require('querystring');

exports.ipn = function(req, res) {
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
      //TODO log the error response
      console.log('err in verify response ===>', err);
    }
    else {
      console.log('verify response ===>', resp);
    }
  });

  res.send(200);
};
