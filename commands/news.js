const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const html2md = require('html-to-md');
const Parser = require('rss-parser');

function news(author, interaction) {
    return new Parser().parseURL('http://shogihub.com/updates.atom')
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
    for (const entry of feed.items.values())
        if (entry.title.startsWith('NEWS'))
            embeds.push(formatEntry(entry, feed.link));
    return embeds;
}

function formatEntry(entry, link) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((timestamp - now) / (3600 * 24)), 0), 255);
    const summary = formatSummary(html2md(entry.contentSnippet));
    const image = getImage(html2md(entry.content));
    var embed = new Discord.MessageEmbed()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: entry.author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', link: link})
        .setTitle(entry.title)
        .setURL(entry.link)
        .setDescription(`<t:${timestamp}:F>\n${summary}`);
    if (image)
        embed = embed.setThumbnail(image)
    return embed;
}

function formatSummary(snippet) {
    if (snippet.length < 200)
        return snippet;
    const lines = snippet.split(/\r?\n/);
    var message = '';
    while (message.length < 120)
        message += `${lines.shift()}\n`;
    return message.trim();
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
