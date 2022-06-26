const assert = require('assert');
const formatTable = require('../lib/format-table');

describe('Commands', function() {
  describe('formatTable()', function() {
    it('should format candidates', function() {
      assert.equal(`\`\`\`Rank     Player                    Rating     Score     
1        GM Ian Nepomniachtchi     2766       5,5       
2        GM Fabiano Caruana        2783       5         
3        GM Hikaru Nakamura        2760       3,5       
4        GM Jan-Krysztof Duda      2750       3         
4        GM Liren Ding             2806       3         
4        GM Richard Rapport        2764       3         
7        GM Radjabov Teimour       2753       2,5       
8        GM Alireza Firouzja       2793       2,5       \`\`\``, formatTable('|Rank|Player|Rating|Score|',
`|1|GM Ian Nepomniachtchi|2766|5,5|
|2|GM Fabiano Caruana|2783|5|
|3|GM Hikaru Nakamura|2760|3,5|
|4|GM Jan-Krysztof Duda|2750|3|
|4|GM Liren Ding|2806|3|
|4|GM Richard Rapport|2764|3|
|7|GM Radjabov Teimour|2753|2,5|
|8|GM Alireza Firouzja|2793|2,5|`));
    });
  });
});

