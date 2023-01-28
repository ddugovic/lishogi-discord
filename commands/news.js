const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatChunks, formatError } = require('../lib/format-pages');
const html2md = require('html-to-md');
const { parseFeed, formatContent, getAuthorName, getContent, getURL } = require('../lib/parse-feed');

function news(author, interaction) {
    const url = 'http://shogihub.com/updates.atom';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => formatNews(feed))
        .then(embeds => formatChunks(embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): ${error}`);
            return formatError(status, statusText, interaction);
        });
}

function formatNews(feed) {
    const embeds = [];
    const authorURL = feed.link[0]['$'].href;
    for (const entry of feed.entry.values())
        if (entry.title.startsWith('NEWS'))
            embeds.push(formatEntry(entry, authorURL));
    return embeds;
}

function formatEntry(entry, authorURL) {
    const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const authorName = getAuthorName(entry);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: authorName, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: authorURL})
        .setTitle(entry.title)
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 200)}`);
    const url = getURL(entry);
    if (url)
        embed = embed.setURL(url);
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
    news(interaction.user, interaction);
}

module.exports = {process, interact};
