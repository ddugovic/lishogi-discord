const sanitizeHtml = require('sanitize-html');
    
function parseHtml(html) {
    return sanitizeHtml(html, {
        allowedAttributes: {},
        allowedTags: []
    });
}
    
module.exports = parseHtml;
