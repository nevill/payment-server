var mongoose = require('mongoose');
var nconf = require('nconf');

var loadConfig = require('../config');
loadConfig();

function handleDbError(err) {
  if (err) {
    console.error('mongodb error:', err.message);
    process.exit(1);
  }
}

exports.init = function(notClear, fn) {
  if ('function' === typeof notClear) {
    fn = notClear;
    notClear = false;
  }

  if (mongoose.connection.readyState !== 1) {
    mongoose.connect(nconf.get('database:url'), function(err) {
      handleDbError(err);
      if (!notClear) {
        var db = mongoose.connection.db;
        db.dropDatabase(function(err) {
          handleDbError(err);
          fn();
        });
      } else {
        fn();
      }
    });
  } else {
    fn();
  }
};

exports.models = require('../model');
