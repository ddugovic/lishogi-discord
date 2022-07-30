const parseHtml = require('./parse-html');
const xml2js = require('xml2js');
    
function parseFeed(xml) {
    var feed;
    new xml2js.Parser({ explicitArray: false }).parseString(xml, (err, result) => {
        if (err)
            throw err;
        feed = result.feed ?? result.rss;
    });
    return feed;
}

function formatContent(content, length) {
    content = parseHtml(content);
    if (content.length < 200)
        return content;
    const snippet = content.split(/\r?\n/);
    var message = '';
    while (message.length < length)
        message += `${snippet.shift()}\n`;
    return message.trim();
}

function getAuthorName(entry) {
    return entry.author.name;
}

function getContent(entry) {
    return entry.content['_'];
}

function getImageURL(entry) {
    if (entry.tag && entry.tag['_'] == 'media:thumbnail')
        return entry.tag['$'].url;
}

function getURL(entry) {
    if (entry.link)
        return entry.link['$'].href;
}
    
module.exports = { parseFeed, formatContent, getAuthorName, getContent, getImageURL, getURL };
