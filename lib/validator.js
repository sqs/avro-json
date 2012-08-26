var _ = require("underscore");

var AvroSpec = {
  PrimitiveTypes: ['null', 'boolean', 'int', 'long', 'float', 'double', 'bytes', 'string'],
  ComplexTypes: ['record', 'enum', 'array', 'map', 'union', 'fixed']
};
AvroSpec.Types = AvroSpec.PrimitiveTypes.concat(AvroSpec.ComplexTypes);

var InvalidSchemaError = function(msg) { return new Error('InvalidSchemaError: ' + msg); };

function Record(name, namespace, fields) {
  function validateArgs(name, namespace, fields) {
    if (!_.isString(name)) {
      throw new InvalidSchemaError('Record name must be string');
    }

    if (!_.isNull(namespace) && !_.isUndefined(namespace) && !_.isString(namespace)) {
      throw new InvalidSchemaError('Record namespace must be string or null');
    }

    if (!_.isArray(fields)) {
      throw new InvalidSchemaError('Record name must be string');
    }
  }

  validateArgs(name, namespace, fields);

  this.name = name;
  this.namespace = namespace;
  this.fields = fields;
}

function Primitive(type) {
  function validateArgs(type) {
    if (!_.isString(type)) {
      throw new InvalidSchemaError('Primitive type name must be a string');
    }

    if (!_.contains(AvroSpec.PrimitiveTypes, type)) {
      throw new InvalidSchemaError('Primitive type must be one of: ' + JSON.stringify(AvroSpec.PrimitiveTypes) + '; got ' + type);
    }
  }

  validateArgs(type);

  this.type = type;
}

function Validator(schema) {
  this.validate = function(obj) {
    return _validate(this.schema, obj);
  };

  var _validate = function(schema, obj) {
    if (schema instanceof Record) {
      return _validateRecord(schema, obj);
    } else if (schema instanceof Primitive) {
      return _validatePrimitive(schema, obj);
    } else {
      throw new InvalidSchemaError('validation not yet implemented: ' + schema);
    }
  };

  var _validateRecord = function(schema, obj) {
    if (!_.isObject(obj) || _.isArray(obj)) {
      return false;
    }

    return _.all(schema.fields, function(field) {
      return _validate(field.schema, obj[field.name]);
    });
  };

  var _validatePrimitive = function(schema, obj) {
    switch (schema.type) {
      case 'null':
        return _.isNull(obj) || _.isUndefined(obj);
      case 'boolean':
        return _.isBoolean(obj);
      case 'int':
        return _.isNumber(obj) && Math.floor(obj) === obj && Math.abs(obj) <= Math.pow(2, 31);
      case 'long':
        return _.isNumber(obj) && Math.floor(obj) === obj && Math.abs(obj) <= Math.pow(2, 63);
      case 'float':
        return _.isNumber(obj); // TODO: handle NaN?
      case 'double':
        return _.isNumber(obj); // TODO: handle NaN?
      case 'bytes':
        throw new InvalidSchemaError('not yet implemented: ' + schema.type);
      case 'string':
        return _.isString(obj);
      default:
        throw new InvalidSchemaError('unrecognized primitive type: ' + schema.type);
    }
  };

  var _parseSchema = function(schema) {
    if (_.isNull(schema) || _.isUndefined(schema)) {
      throw new InvalidSchemaError('schema is null');
    } else if (_.isString(schema)) {
      if (!_.contains(AvroSpec.PrimitiveTypes, schema)) {
        throw new InvalidSchemaError('unrecognized primitive type: ' + schema);
      }
      return new Primitive(schema);
    } else if (typeof schema === 'object') {
      if (schema.type === 'record') {
        return new Record(schema.name, schema.namespace, schema.fields);
      } else {
        throw new InvalidSchemaError('not yet implemented: ' + schema.type);
      }
    } else {
      throw new InvalidSchemaError('unexpected Javascript type for schema: ' + (typeof schema));
    }
  };

  this.rawSchema = schema;
  this.schema = _parseSchema(schema);
}

Validator.validate = function(schema, obj) {
  return (new Validator(schema)).validate(obj);
};

exports['Validator'] = Validator;
