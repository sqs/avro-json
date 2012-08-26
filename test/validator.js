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
    test.strictEqual(Validator.validate('null', 1), false);
    test.strictEqual(Validator.validate('null', 'a'), false);
    test.done();
  },
  'boolean': function(test) {
    test.ok(Validator.validate('boolean', true));
    test.ok(Validator.validate('boolean', false));
    test.strictEqual(Validator.validate('boolean', null), false);
    test.strictEqual(Validator.validate('boolean', 1), false);
    test.strictEqual(Validator.validate('boolean', 'a'), false);
    test.done();
  },
  'int': function(test) {
    test.ok(Validator.validate('int', 1));
    test.ok(Validator.validate('long', Math.pow(2, 31) - 1));
    test.strictEqual(Validator.validate('int', 1.5), false);
    test.strictEqual(Validator.validate('int', Math.pow(2, 40)), false);
    test.strictEqual(Validator.validate('int', null), false);
    test.strictEqual(Validator.validate('int', 'a'), false);
    test.done();
  },
  'long': function(test) {
    test.ok(Validator.validate('long', 1));
    test.ok(Validator.validate('long', Math.pow(2, 63) - 1));
    test.strictEqual(Validator.validate('long', 1.5), false);
    test.strictEqual(Validator.validate('long', Math.pow(2, 70)), false);
    test.strictEqual(Validator.validate('long', null), false);
    test.strictEqual(Validator.validate('long', 'a'), false);
    test.done();
  },
  'float': function(test) {
    test.ok(Validator.validate('float', 1));
    test.ok(Validator.validate('float', 1.5));
    test.strictEqual(Validator.validate('float', 'a'), false);
    test.strictEqual(Validator.validate('float', null), false);
    test.done();
  },
  'double': function(test) {
    test.ok(Validator.validate('double', 1));
    test.ok(Validator.validate('double', 1.5));
    test.strictEqual(Validator.validate('double', 'a'), false);
    test.strictEqual(Validator.validate('double', null), false);
    test.done();
  },
  'bytes': function(test) {
    // not implemented yet
    test.throws(function() { Validator.validate('bytes', 1); });
    test.done();
  },
  'string': function(test) {
    test.ok(Validator.validate('string', 'a'));
    test.strictEqual(Validator.validate('string', 1), false);
    test.strictEqual(Validator.validate('string', null), false);
    test.done();
  }
};
