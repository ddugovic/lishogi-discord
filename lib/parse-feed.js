const sanitizeHtml = require('sanitize-html');

function formatContent(content, length) {
    content = sanitizeHtml(content, { allowedAttributes: {}, allowedTags: [] });
    if (content.length < 200)
        return content.trim();
    const snippet = content.split(/\r?\n/);
    var message = '';
    while (message.length < length)
        message += `${snippet.shift()}\n`;
    return message.trim();
}

function getURL(entry) {
    if (entry.link)
        return entry.link['$'] ? entry.link['$'].href : entry.link;
}

module.exports = { formatContent, getURL };
