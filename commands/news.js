const axios = require('axios');
const Discord = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const formatColor = require('../lib/format-color');
const html2md = require('html-to-md');
const User = require('../models/User');
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
            var embed = new Discord.MessageEmbed()
                .setColor(formatColor(red, 0, 255-red))
                .setAuthor({name: entry.author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: getLink(entry.author)})
                .setTitle(entry.title)
                .setURL(entry.link)
                .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
                .setDescription(summary);
            const image = getImage(html2md(entry.content));
            if (image)
                embed = embed.setImage(image)
            embeds.push(embed);
        }
    }
    if (interaction) {
        const button1 = new Discord.MessageButton()
            .setCustomId('previousbtn')
            .setLabel('Previous')
            .setStyle('PRIMARY');
        const button2 = new Discord.MessageButton()
            .setCustomId('nextbtn')
            .setLabel('Next')
            .setStyle('PRIMARY');
        return paginationEmbed(interaction, embeds, [button1, button2]);
    }
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

function getLink(author) {
    for (match of author.matchAll(/@(\w+)/g)) {
        return `https://lishogi.org/@/${match[1]}`;
    }
}

function getImage(content) {
    for (match of content.matchAll(/!\[\]\((\S+)\)/g))
        return match[1];
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return news(interaction.user, interaction);
}

module.exports = {process, interact};
