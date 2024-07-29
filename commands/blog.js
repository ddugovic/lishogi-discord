const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatPages } = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const html2md = require('html-to-md');
const { formatContent, getURL } = require('../lib/parse-feed');
const Parser = require('rss-parser');

function blog(author, interaction) {
    const url = 'https://lishogi.org/blog.atom';
    return new Parser().parseURL(url)
        .then(feed => feed.items.map(formatEntry))
        .then(embeds => formatPages('Entry', embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${author.username}): ${error}`);
            return `An error occurred handling your request: ${url} failed to respond`;
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const authorName = entry.author;
    const content = entry.content;
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({ name: authorName, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: getUserLink(authorName) })
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 80)}`);
    const image = getImage(html2md(content));
    if (image)
        embed = embed.setImage(image);
    return embed;
}

function getImage(content) {
    const match = content.match(/!\[.*?\]\((\S+)\)/)
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
