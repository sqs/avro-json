var Validator = require('../lib/validator.js').Validator;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['test'] = {
  setUp: function(done) {
    done();
  },
  'nonexistent/null/undefined': function(test) {
    test.throws(function() { return new Validator(); });
    test.throws(function() { return new Validator(null); });
    test.throws(function() { return new Validator(undefined); });
    test.done();
  },
  'unrecognized primitive type name': function(test) {
    test.throws(function() { return new Validator('badtype'); });
    test.done();
  },
  'invalid schema javascript type': function(test) {
    test.throws(function() { return new Validator(123); });
    test.throws(function() { return new Validator(function() { }); });
    test.done();
  },

  // Primitive types
  'null': function(test) {
    test.ok(Validator.validate('null', null));
    test.ok(Validator.validate('null', undefined));
    test.throws(function() { Validator.validate('null', 1); });
    test.throws(function() { Validator.validate('null', 'a'); });
    test.done();
  },
  'boolean': function(test) {
    test.ok(Validator.validate('boolean', true));
    test.ok(Validator.validate('boolean', false));
    test.throws(function() { Validator.validate('boolean', null); });
    test.throws(function() { Validator.validate('boolean', 1); });
    test.throws(function() { Validator.validate('boolean', 'a'); });
    test.done();
  },
  'int': function(test) {
    test.ok(Validator.validate('int', 1));
    test.ok(Validator.validate('long', Math.pow(2, 31) - 1));
    test.throws(function() { Validator.validate('int', 1.5); });
    test.throws(function() { Validator.validate('int', Math.pow(2, 40)); });
    test.throws(function() { Validator.validate('int', null); });
    test.throws(function() { Validator.validate('int', 'a'); });
    test.done();
  },
  'long': function(test) {
    test.ok(Validator.validate('long', 1));
    test.ok(Validator.validate('long', Math.pow(2, 63) - 1));
    test.throws(function() { Validator.validate('long', 1.5); });
    test.throws(function() { Validator.validate('long', Math.pow(2, 70)); });
    test.throws(function() { Validator.validate('long', null); });
    test.throws(function() { Validator.validate('long', 'a'); });
    test.done();
  },
  'float': function(test) {
    test.ok(Validator.validate('float', 1));
    test.ok(Validator.validate('float', 1.5));
    test.throws(function() { Validator.validate('float', 'a'); });
    test.throws(function() { Validator.validate('float', null); });
    test.done();
  },
  'double': function(test) {
    test.ok(Validator.validate('double', 1));
    test.ok(Validator.validate('double', 1.5));
    test.throws(function() { Validator.validate('double', 'a'); });
    test.throws(function() { Validator.validate('double', null); });
    test.done();
  },
  'bytes': function(test) {
    // not implemented yet
    test.throws(function() { Validator.validate('bytes', 1); });
    test.done();
  },
  'string': function(test) {
    test.ok(Validator.validate('string', 'a'));
    test.throws(function() { Validator.validate('string', 1); });
    test.throws(function() { Validator.validate('string', null); });
    test.done();
  },

  // Records
  'empty-record': function(test) {
    var schema = {type: 'record', name: 'EmptyRecord', fields: []};
    test.ok(Validator.validate(schema, {}));
    test.throws(function() { Validator.validate(schema, 1); });
    test.throws(function() { Validator.validate(schema, null); });
    test.throws(function() { Validator.validate(schema, 'a'); });
    test.done();
  },
  'record-with-string': function(test) {
    var schema = {type: 'record', name: 'EmptyRecord', fields: [{name: 'stringField', type: 'string'}]};
    test.ok(Validator.validate(schema, {stringField: 'a'}));
    test.throws(function() { Validator.validate(schema, {}); });
    test.throws(function() { Validator.validate(schema, {stringField: 1}); });
    test.throws(function() { Validator.validate(schema, {stringField: []}); });
    test.throws(function() { Validator.validate(schema, {stringField: {}}); });
    test.throws(function() { Validator.validate(schema, {stringField: null}); });
    test.throws(function() { Validator.validate(schema, {stringField: 'a', unexpectedField: 'a'}); });
    test.done();
  },
  'record-with-string-and-number': function(test) {
    var schema = {type: 'record', name: 'EmptyRecord', fields: [{name: 'stringField', type: 'string'}, {name: 'intField', type: 'int'}]};
    test.ok(Validator.validate(schema, {stringField: 'a', intField: 1}));
    test.throws(function() { Validator.validate(schema, {}); });
    test.throws(function() { Validator.validate(schema, {stringField: 'a'}); });
    test.throws(function() { Validator.validate(schema, {intField: 1}); });
    test.throws(function() { Validator.validate(schema, {stringField: 'a', intField: 1, unexpectedField: 'a'}); });
    test.done();
  },

  // Enums
  'enum': function(test) {
    var schema = {type: 'enum', name: 'Colors', symbols: ['Red', 'Blue']};
    test.ok(Validator.validate(schema, 'Red'));
    test.ok(Validator.validate(schema, 'Blue'));
    test.throws(function() { Validator.validate(schema, null); });
    test.throws(function() { Validator.validate(schema, undefined); });
    test.throws(function() { Validator.validate(schema, 'NotAColor'); });
    test.throws(function() { Validator.validate(schema, ''); });
    test.throws(function() { Validator.validate(schema, {}); });
    test.throws(function() { Validator.validate(schema, []); });
    test.throws(function() { Validator.validate(schema, 1); });
    test.done();
  },

  // Unions
  'union': function(test) {
    var schema = ['string', 'int'];
    test.ok(Validator.validate(schema, {string: 'a'}));
    test.ok(Validator.validate(schema, {int: 1}));
    test.throws(function() { Validator.validate(schema, null); });
    test.throws(function() { Validator.validate(schema, undefined); });
    test.throws(function() { Validator.validate(schema, 'a'); });
    test.throws(function() { Validator.validate(schema, 1); });
    test.throws(function() { Validator.validate(schema, {string: 'a', int: 1}); });
    test.throws(function() { Validator.validate(schema, []); });
    test.done();
  }
};
