var mongoose = require('mongoose');
var nconf = require('./config');

mongoose.connect(nconf.get('database:url'), function(err) {
  if (err) {
    console.error('mongodb error:', err.message);
    process.exit(1);
  }
});

var callbacks = [];
mongoose.connection.on('open', function() {
  callbacks.forEach(function(callback) {
    process.nextTick(callback);
  });
});

exports.init = function(next) {
  if (mongoose.connection.readyState !== 1) {
    callbacks.push(next);
  } else {
    process.nextTick(next);
  }
};
