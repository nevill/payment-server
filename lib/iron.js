var util = require('util');
var Common = require('./common');

var RequiredOptions = ['projectId', 'token', 'endpoint', 'workers'];
var RequiredWorkers = ['webhook'];

function Iron(options) {
  Common.hasRequiredKeys(options, RequiredOptions);
  this.projectId = options.projectId;
  this.token = options.token;
  this.endpoint = options.endpoint;

  Common.hasRequiredKeys(options.workers, RequiredWorkers);
  this.workers = options.workers;
}

var Paths = {
  Task: '/2/projects/%s/tasks'
};

// Enqueue a webhook request
// payload {Object} contains two keys
//   - url {String} webhook's url, will be sent with a POST request
//   - body {Object} the data will be posted to
// next {Function} callback to indicate if the task has been queued up
Iron.prototype.enqueue = function(payload, next) {
  var reqBody = {
    tasks: [{
      'code_name': this.workers.webhook,
      'payload': JSON.stringify(payload)
    }]
  };

  var options = {
    host: this.endpoint,
    path: util.format(Paths.Task, this.projectId),
    headers: {
      'Authorization': 'OAuth ' + this.token,
      'Content-Type': 'application/json'
    }
  };

  Common.httpsRequest(reqBody, options, function(err, resp) {
    if (!err && String(resp.statusCode) !== '200') {
      err = new Error('Something went wrong ' +
        'when enqueue a webhook to: ' + payload.url);
    }
    next(err);
  });
};

module.exports = Iron;
