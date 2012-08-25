var _ = require("underscore");

var AvroSpec = {
  PrimitiveTypes: ['null', 'boolean', 'int', 'long', 'float', 'double', 'bytes', 'string']
};

function Validator(schema) {
  this.schema = schema;

  var validateSchema = function(schema) {
    if (schema === null || schema === undefined) {
      throw new InvalidSchemaError('schema is null');
    } else if (typeof schema === 'string') {
      if (!_.contains(AvroSpec.PrimitiveTypes, schema)) {
        throw new InvalidSchemaError('unrecognized primitive type: ' + schema);
      }
    } else if (typeof schema === 'number' || typeof schema === 'function') {
      throw new InvalidSchemaError('schema is ' + (typeof schema));
    }
  };

  var InvalidSchemaError = function(msg) { return new Error('InvalidSchemaError: ' + msg); };

  validateSchema(this.schema);
}

exports['Validator'] = Validator;
