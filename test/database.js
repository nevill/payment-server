var mongoose = require('mongoose');
var nconf = require('../config');
var async = require('async');
var fixtures = require('./fixture');

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
var _createModel = function(modelName, next) {
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
exports.loadFixtures = function(done) {
  if (fixturesLoaded) {
    done();
  } else {
    async.each(Object.keys(fixtures), _createModel, function(err) {
      if (err) {
        console.error(err.message);
        process.exit(1);
      }
      fixturesLoaded = true;
      done();
    });
  }
};

var _dropModel = function(modelName, next) {
  var collectionName = models[modelName].schema.options.collection;
  mongoose.connection.db.dropCollection(collectionName, next);
};
exports.unloadFixtures = function(done) {
  if (!fixturesLoaded) {
    done();
  } else {
    this.dropModels(Object.keys(fixtures), function() {
      fixturesLoaded = false;
      done();
    });
  }
};

exports.dropModels = function(modelNames, done) {
  if (typeof modelNames === 'string') {
    modelNames = [modelNames];
  }
  async.each(modelNames, _dropModel, function(err) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
    done();
  });
};
