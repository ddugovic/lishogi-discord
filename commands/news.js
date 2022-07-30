const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const html2md = require('html-to-md');
const { parseFeed, formatContent, getAuthorName, getContent, getImageURL, getURL } = require('../lib/parse-feed');

function news(author, interaction) {
    const url = 'http://shogihub.com/updates.atom';
    return axios.get(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => parseFeed(response.data))
        .then(feed => formatNews(feed))
        .then(embeds => formatPages(embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatNews(feed) {
    const embeds = [];
    for (const entry of feed.entry.values())
        if (entry.title.startsWith('NEWS'))
            embeds.push(formatEntry(entry, feed.link));
    return embeds;
}

function formatEntry(entry, link) {
    const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const authorName = getAuthorName(entry);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: authorName, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', link: link})
        .setTitle(entry.title)
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 120)}`);
    const url = getURL(entry);
    if (url)
        embed = embed.setURL(url);
    const image = getImageURL(entry);
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
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return news(interaction.user, interaction);
}

module.exports = {process, interact};
