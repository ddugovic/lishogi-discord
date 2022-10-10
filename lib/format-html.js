const html2md = require('html-to-md');
const { EmbedBuilder } = require('discord.js');
const { formatSiteLinks } = require('./format-site-links');

function formatLog(document) {
    const embeds = [];
    const pattern = /(?<=^|\n)## (.+)\r?\n\r?\n((?:.+\r?\n)+)/g;
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatEntry(match[1], match[2]));
    return embeds;
}

function formatEntry(name, description) {
    return new EmbedBuilder()
        .setTitle(name)
        .setURL('https://lichess.org/changelog')
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(formatSiteLinks(description));
}

module.exports = formatLog;
