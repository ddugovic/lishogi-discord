const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatChunks } = require('../lib/format-pages');
const html2md = require('html-to-md');
const { formatContent, getURL } = require('../lib/parse-feed');
const Parser = require('rss-parser');

function news(author, interaction) {
    const url = 'https://news.google.com/rss/search?q=shogi';
    return new Parser().parseURL(url)
        .then(feed => feed.items.map(entry => formatEntry(entry, feed.description, feed.link)))
        .then(embeds => formatChunks(embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): ${error}`);
            return `An error occurred handling your request: ${url} failed to respond`;
        });
}

function formatEntry(entry, authorName, authorURL) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const content = entry.content;
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: `📰 ${authorName}`, url: authorURL})
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 200)}`);
    const image = getImage(html2md(content));
    if (image)
        embed = embed.setThumbnail(image);
    return embed;
}

function getImage(content) {
    const match = content.match(/!\[.*?\]\((\S+)\)/)
    if (match)
        return match[1];
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return news(interaction.user, interaction);
}

module.exports = {process, interact};
