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

function getAuthorName(entry) {
    return entry.author.name;
}

function getCategories(entry) {
    if (entry.category)
        return (typeof entry.category == 'string') ? [entry.category] : entry.category;
}

function getTitle(entry) {
    return entry.title['_'];
}

function getThumbnailURL(entry) {
    if (entry['media:thumbnail'])
        return entry['media:thumbnail']['$'].url;
    if (entry.tag && entry.tag['_'] == 'media:thumbnail')
        return entry.tag['$'].url;
}

function getTopics(entry) {
    if (entry.category) {
        const topics = [];
        for (const [_, value] of Object.entries(entry.category))
	    topics.push(value['$'] ?? value);
        return topics;
    }
}

function getURL(entry) {
    if (entry.link)
        return entry.link[0] ? entry.link[entry.link.length-1]['$'].href : entry.link['$'].href;
}
    
module.exports = { formatContent, getAuthorName, getCategories, getTitle, getThumbnailURL, getTopics, getURL };
