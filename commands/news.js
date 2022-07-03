const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const html2md = require('html-to-md');
const Parser = require('rss-parser');

function news(author, interaction) {
    return new Parser().parseURL('http://shogihub.com/updates.atom')
        .then(feed => formatNews(feed, interaction))
        .catch(error => {
            console.log(`Error in news(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatNews(news, interaction) {
    const embeds = [];
    for (const entry of news.items.values()) {
        if (entry.title.startsWith('NEWS')) {
            const summary = formatEntry(entry);
            const red = Math.min(Math.max(summary.length - 150, 0), 255);
            const image = getImage(html2md(entry.content));
            var embed = new Discord.MessageEmbed()
                .setColor(formatColor(red, 0, 255-red))
                .setAuthor({name: entry.author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png'})
                .setTitle(entry.title)
                .setURL(entry.link)
                .setDescription(summary);
            if (image)
                embed = embed.setThumbnail(image)
            embeds.push(embed);
        }
    }
    if (interaction)
        return formatPages(embeds, interaction);
    return { 'embeds': embeds.slice(0, 1) };
}

function getImage(content) {
    const match = content.match(/!\[.*?\]\((\S+)\)/)
    if (match)
        return match[1];
}

function formatEntry(entry) {
    if (entry.contentSnippet.length < 200)
        return entry.contentSnippet;
    const snippet = entry.contentSnippet.split(/\r?\n/);
    var message = '';
    while (message.length < 80)
        message += `${snippet.shift()}\n`;
    return message.trim();
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return news(interaction.user, interaction);
}

module.exports = {process, interact};
