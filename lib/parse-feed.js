const parseHtml = require('./parse-html');
const xml2js = require('xml2js');
    
async function parseFeed(xml) {
    const document = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(xml);
    return document.feed ?? document.rss;
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

function getSummary(entry) {
    return entry.summary['_'];
}

function getTitle(entry) {
    return entry.title['_'];
}

function getThumbnailURL(entry) {
    if (entry['media:thumbnail'])
        return entry['media:thumbnail']['$'].url;
}

function getURL(entry) {
    if (entry.link)
        return entry.link[0] ? entry.link[entry.link.length-1]['$'].href : entry.link['$'].href;
}
    
module.exports = { parseFeed, formatContent, getAuthorName, getContent, getImageURL, getSummary, getTitle, getThumbnailURL, getURL };
