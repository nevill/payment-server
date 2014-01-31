var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');

var ModelFiles = ['payment.js'];
var schemaPath = './schema';
var methodPath = './method';
var validatorPath = './validator';

ModelFiles.forEach(function(name) {
  var schemaInfo = require(path.join(__dirname, schemaPath, name));
  var modelName = schemaInfo.modelName;
  var schema = schemaInfo.schema;

  var methodFile = path.join(__dirname, methodPath, name);
  if (fs.existsSync(methodFile)) {
    require(methodFile)(schema);
  }

  var validatorFile = path.join(__dirname, validatorPath, name);
  if (fs.existsSync(validatorFile)) {
    require(validatorFile)(schema);
  }

  mongoose.model(modelName, schema);
});

module.exports = exports = mongoose.models;
exports.constants = require('./constant');
