// To setup iron worker
//
// - create a .iron.json file in ~/.iron.json, it should look like
//   {
//     "token": "YOUR TOKEN",
//     "project_id": "YOUR PROJECT ID"
//   }

// - make sure your ruby is 1.9.3+
//   gem install iron_worker_ng

// - upload the worker
//   iron_worker upload notification

// - Reference
//   http://dev.iron.io/worker/reference/api/
//   http://dev.iron.io/worker/languages/nodejs/
//   https://github.com/iron-io/iron_worker_examples/tree/master/node/worker101

var fs = require('fs');
var url = require('url');

var parseArgs = function(args, next) {
  var payloadIndex = -1;
  args.forEach(function(val, index) {
    if (val === '-payload') {
      payloadIndex = index + 1;
      return;
    }
  });

  if (payloadIndex > -1 && payloadIndex < args.length) {
    fs.readFile(args[payloadIndex], function(err, data) {
      if (err) {
        console.log('Error occurred when open file:', err);
      } else {
        next(JSON.parse(data));
      }
    });
  } else {
    next();
  }
};

var request = function(params, next) {
  var urlObj = url.parse(params.url);

  if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
    var client = require(urlObj.protocol.slice(0, -1));
    var body = params.body || {};
    if (typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    var options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.path,
      method: 'POST',
      headers: {
        'Content-Length': body.length,
        'Content-Type': 'application/json; charset=utf-8'
      }
    };

    var reqObj = client.request(options, function(respObj) {
      var data = [];

      respObj.on('data', function(d) {
        data.push(d);
      });

      respObj.on('end', function() {
        next(null, {
          statusCode: respObj.statusCode,
          body: data.join('')
        }, respObj);
      });
    });

    reqObj.on('error', function(e) {
      next(e);
    });

    reqObj.write(body);
    reqObj.end();
  } else {
    throw new Error('Only can send http request');
  }
};

// send a POST request to options.url with options.body
var remoteCall = function(options, next) {
  var retryCount = 3; // retry 3 times
  var retryInterval = 10000; // retry every 10 seconds

  var retry = function(err) {
    if (err && retryCount > 0) {
      console.log('retry count:', retryCount, '\nerror occurred:', err);
      retryCount--;
      setTimeout(function() {
        request(options, retry);
      }, retryInterval);
    } else {
      next.apply(null, arguments);
    }
  };

  request(options, retry);
};

// Expect to have payload with params: url, body
// - `url` where the post request sent to, have to specify http or https
//   https is always preferred if deploy in production
// - `body` the content sent with, in JSON format
var args = process.argv.slice(2);
parseArgs(args, function(data) {
  remoteCall(data, function(err, response) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log('response status:', response.statusCode);
      console.log('response body: \n', response.body);
    }
  });
});
