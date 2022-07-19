const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const html2md = require('html-to-md');
const Parser = require('rss-parser');

function blog(author, interaction) {
    return new Parser().parseURL('https://lidraughts.org/blog.atom')
        .then(feed => Array.from(feed.items.values(), formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    return new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({ name: entry.author, iconURL: 'https://lidraughts.org/assets/images/favicon-32-black.png', url: getUserLink(entry.author) })
        .setTitle(entry.title)
        .setURL(entry.link)
        .setThumbnail(getImage(html2md(entry.content)) ?? 'https://lidraughts.org/assets/favicon.64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatSnippet(entry.contentSnippet)}`);
}

function formatSnippet(contentSnippet) {
    if (contentSnippet.length < 200)
        return contentSnippet;
    const snippet = contentSnippet.split(/\r?\n/);
    var message = '';
    while (message.length < 80)
        message += `${snippet.shift()}\n`;
    return message.trim();
}

function getImage(content) {
    const match = content.match(/!\[\]\((\S+)\)/)
    if (match)
        return match[1];
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return blog(interaction.user, interaction);
}

module.exports = {process, interact};
