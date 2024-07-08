const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatChunks } = require('../lib/format-pages');
const html2md = require('html-to-md');
const { parseFeed, formatContent, getAuthorName, getContent, getURL } = require('../lib/parse-feed');

function news(author, interaction) {
    const url = 'https://news.google.com/rss/search?q=shogi';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => formatNews(feed))
        .then(embeds => formatChunks(embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatNews(feed) {
    const channel = feed.channel;
    const embeds = [];
    const authorName = channel.title;
    const authorURL = channel.link;
    for (const entry of channel.item)
        embeds.push(formatEntry(entry, authorName, authorURL));
    return embeds;
}

function formatEntry(entry, authorName, authorURL) {
    const timestamp = Math.floor(new Date(entry.pubDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: authorName, url: authorURL})
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

async function interact(interaction) {
    await interaction.deferReply();
    await interaction.editReply(await news(interaction.user, interaction));
}

module.exports = {process, interact};
