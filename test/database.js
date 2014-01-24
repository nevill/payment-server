var mongoose = require('mongoose');
var nconf = require('nconf');
var async = require('async');

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

var models = exports.models = require('../model');

var fixturesLoaded = false;
exports.loadFixtures = function(done) {
  if (fixturesLoaded) {
    done();
  } else {
    var fixtures = require('./fixture');

    var createModel = function(modelName, next) {
      var modelClass = models[modelName];
      var object = fixtures[modelName];
      if (Array.isArray(object)) {
        async.each(object, function(attrs, next) {
          modelClass.create(attrs, next);
        }, next);
      } else {
        modelClass.create(object, next);
      }
    };

    async.each(Object.keys(fixtures), createModel, function(err) {
      if (err) {
        console.error(err.message);
        process.exit(1);
      }
      fixturesLoaded = true;
      done();
    });
  }
};
