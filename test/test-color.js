const assert = require('assert');
const formatColor = require('../lib/format-color');

describe('Commands', function() {
  describe('formatColor()', function() {
    it('should format red', function() {
      assert.equal('#FF0000', formatColor(255, 0, 0));
    });
  });
});
