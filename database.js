var mongoose = require('mongoose');
var nconf = require('./config');

var callbacks = [];
if (mongoose.connection.readyState !== 1) {
  mongoose.connect(nconf.get('database:url'), function(err) {
    if (err) {
      console.error('mongodb error:', err.message);
      process.exit(1);
    } else {
      callbacks.forEach(function(callback) {
        process.nextTick(callback);
      });
    }
  });
}

exports.init = function(next) {
  if (mongoose.connection.readyState !== 1) {
    callbacks.push(next);
  } else {
    process.nextTick(next);
  }
};
