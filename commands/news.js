const axios = require('axios');
const Discord = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const User = require('../models/User');
const Parser = require('rss-parser');

function news(author, interaction) {
    return new Parser().parseURL('http://www.thechessmind.net/blog/rss.xml')
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
        const summary = formatEntry(entry);
        const red = Math.min(Math.max(summary.length - 150, 0), 255);
        var embed = new Discord.MessageEmbed()
            .setColor(formatColor(red, 0, 255-red))
            .setAuthor({name: entry.creator, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', link: news.link})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setDescription(summary);
        if (entry.categories)
            embed = embed.addField('Categories', entry.categories.map(category => `[${category}](http://www.thechessmind.net/blog/tag/${link(category)})`).join(', '));
        embeds.push(embed);
    }
    if (interaction)
        return formatPages(embeds, interaction);
    return { 'embeds': embeds.slice(0, 1) };
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

function link(str) {
    return str.toLowerCase().replace(/\s+/, '-');
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return news(interaction.user, interaction);
}

module.exports = {process, interact};