var assert = require('assert');
var format = require('../lib/format-seconds');
describe('Commands', function() {
  describe('formatSeconds()', function() {
    it('should format 0 seconds', function() {
      assert.equal("0 seconds", format.formatSeconds(0));
    });
    it('should format 1 second', function() {
      assert.equal("1 second", format.formatSeconds(1));
    });
    it('should format 2 seconds', function() {
      assert.equal("2 seconds", format.formatSeconds(2));
    });
    it('should format 1 minute, 1 second', function() {
      assert.equal("1 minute, 1 second", format.formatSeconds(61));
    });
    it('should format 2 minutes, 2 seconds', function() {
      assert.equal("2 minutes, 2 seconds", format.formatSeconds(122));
    });
    it('should format 1 hour', function() {
      assert.equal("1 hour", format.formatSeconds(3600));
    });
    it('should format 2 hours', function() {
      assert.equal("2 hours", format.formatSeconds(7200));
    });
    it('should format 1 day', function() {
      assert.equal("1 day", format.formatSeconds(86400));
    });
    it('should format 2 days', function() {
      assert.equal("2 days", format.formatSeconds(172800));
    });
  });
});
