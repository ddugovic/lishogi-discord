const assert = require('assert');
const formatSeconds = require('../lib/format-seconds');

describe('Commands', function() {
  describe('formatSeconds()', function() {
    it('should format **0** seconds', function() {
      assert.equal('**0** seconds', formatSeconds(0));
    });
    it('should format **1** second', function() {
      assert.equal('**1** second', formatSeconds(1));
    });
    it('should format **2** seconds', function() {
      assert.equal('**2** seconds', formatSeconds(2));
    });
    it('should format **1** minute, **1** second', function() {
      assert.equal('**1** minute, **1** second', formatSeconds(61));
    });
    it('should format **2** minutes, **2** seconds', function() {
      assert.equal('**2** minutes, **2** seconds', formatSeconds(122));
    });
    it('should format **1** hour', function() {
      assert.equal('**1** hour', formatSeconds(3600));
    });
    it('should format **1** hour, **1** minute', function() {
      assert.equal('**1** hour, **1** minute', formatSeconds(3660));
    });
    it('should format **2** hours', function() {
      assert.equal('**2** hours', formatSeconds(7200));
    });
    it('should format **1** day', function() {
      assert.equal('**1** day', formatSeconds(86400));
    });
    it('should format **1** day, **1** hour', function() {
      assert.equal('**1** day, **1** hour', formatSeconds(90000));
    });
    it('should format **2** days', function() {
      assert.equal('**2** days', formatSeconds(172800));
    });
    it('should format **1** year', function() {
      assert.equal('**1** year', formatSeconds(86400 * 365));
    });
    it('should format **1** year, **1** day', function() {
      assert.equal('**1** year, **1** day', formatSeconds(86400 * 366));
    });
    it('should format **2** years', function() {
      assert.equal('**2** years', formatSeconds(86400 * 730));
    });
  });
});
