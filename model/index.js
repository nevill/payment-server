var path = require('path');
var mongoose = require('mongoose');

var Models = ['payment'];
var schemaPath = './schema';

Models.forEach(function(name) {
  var schemaInfo = require(path.join(__dirname, schemaPath, name));
  var modelName = schemaInfo.modelName;
  var schema = schemaInfo.schema;
  mongoose.model(modelName, schema);
});

module.exports = exports = mongoose.models;
exports.constants = require('./constant');
