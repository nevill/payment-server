var https = require('https');

exports.hasRequiredKeys = function hasRequiredKeys(object, keyNames) {
  var missedKeys = keyNames.reduce(function(missedKeys, key) {
    if (!Object.hasOwnProperty.call(object, key)) {
      missedKeys.push(key);
    }
    return missedKeys;
  }, []);

  if (missedKeys.length > 0) {
    throw new Error(
      'Missing required parameter: ' + missedKeys.join(',')
    );
  }
  return true;
};

exports.httpsRequest = function httpsRequest(body, options, callback) {
  if (typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  options.method = options.method || 'POST';
  options.headers['Content-Length'] = body.length;

  //TODO verify SSL certificate
  var httpReq = https.request(options, function(httpResp) {
    var data = [];

    httpResp.on('data', function(d) {
      data.push(d);
    });

    httpResp.on('end', function() {
      callback(null, {
        statusCode: httpResp.statusCode,
        body: data.join('')
      }, httpResp);
    });
  });

  httpReq.on('error', function(e) {
    callback(e);
  });

  httpReq.write(body);
  httpReq.end();
};
