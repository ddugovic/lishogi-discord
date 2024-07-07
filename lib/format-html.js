const html2md = require('html-to-md');
const { EmbedBuilder } = require('discord.js');
const { formatSiteLinks } = require('./format-site-links');
const formatTable = require('./format-table');

function formatLog(document) {
    const embeds = [];
    const pattern = /(?<=^|\n)## (.+)\r?\n\r?\n((?:(\r?\n)?### (?:Key changes|API updates|Broadcast changes|Other updates)\r?\n\r?\n|.+\r?\n)+)/g;
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatLogEntry(match[1], match[2]));
    return embeds;
}

function formatLogEntry(name, description) {
    return new EmbedBuilder()
        .setTitle(name)
        .setURL('https://lichess.org/changelog')
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(formatSiteLinks(description));
}

function formatMarkup(text) {
    text = html2md(text)
    const pattern = /(?<=^|\n)(\|(?:[^\|]+\|)+)\r?\n\|(?:-+\|)+((?:\r?\n\|(?:[^\|]+\|)+)+)/;
    const match = text.match(pattern);
    if (match)
        text = text.replace(match[0], formatTable(match[1], match[2].trim()))
    return text;
}

module.exports = { formatLog, formatMarkup };
