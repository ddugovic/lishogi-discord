const sanitizeHtml = require('sanitize-html');
const xml2js = require('xml2js');

async function parseFeed(xml) {
    const document = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(xml);
    return document.feed ?? document.rss;
}

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

function getAuthors(entry) {
    if (entry.author)
        return entry.author;
    if (entry.source)
        return entry.source['_'];
}

function getContent(entry) {
    if (entry.content)
        return entry.content['_'];
    return entry.description;
}

function getImageURL(entry) {
    if (entry.tag && entry.tag['_'] == 'media:thumbnail')
        return entry.tag['$'].url;
}

function getURL(entry) {
    if (entry.link)
        return entry.link['$'] ? entry.link['$'].href : entry.link;
}

module.exports = { parseFeed, formatContent, getAuthors, getContent, getImageURL, getURL };
