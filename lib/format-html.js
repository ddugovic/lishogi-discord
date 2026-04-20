const html2md = require('html-to-md');
const { EmbedBuilder } = require('discord.js');
const { formatSiteLinks } = require('./format-site-links');
const formatTable = require('./format-table');

function formatLog(document) {
    const embeds = [];
    const pattern = /(?<=^|\n)## (.+)\r?\n\r?\n((?:(\r?\n)?### (?:[^\r\n]+ changes|[^\r\n]+ updates)\r?\n\r?\n|.+\r?\n)+)/gi;
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatLogEntry(match[1], match[2]));
    return embeds;
}

function formatLogEntry(name, description) {
    return new EmbedBuilder()
        .setTitle(name)
        .setURL('https://lichess.org/changelog')
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(truncate(description));
}

function truncate(text) {
    const lines = text.split(/\n/);
    while (lines.join('\n').length > 2000) {
        lines.pop();
    }
    return lines.join('\n');
}

module.exports = { formatLog };
