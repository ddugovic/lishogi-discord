const axios = require('axios');
const Discord = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const formatColor = require('../lib/format-color');
const html2md = require('html-to-md');
const User = require('../models/User');
const Parser = require('rss-parser');

function blog(author, interaction) {
    return new Parser().parseURL('https://lichess.org/blog.atom')
        .then(feed => formatBlog(feed, interaction))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBlog(blog, interaction) {
    const embeds = [];
    for (const entry of blog.items.values()) {
        const summary = formatEntry(entry);
        const red = Math.min(Math.max(summary.length - 150, 0), 255);
        var embed = new Discord.MessageEmbed()
            .setColor(formatColor(red, 0, 255-red))
            .setAuthor({name: entry.author, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getLink(entry.author)})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
            .setDescription(summary);
        const image = getImage(html2md(entry.content));
        if (image)
            embed = embed.setImage(image)
        embeds.push(embed);
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
        return `https://lichess.org/@/${match[1]}`;
    }
}

function getImage(content) {
    for (match of content.matchAll(/!\[\]\((\S+)\)/g))
        return match[1];
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return blog(interaction.user, interaction);
}

module.exports = {process, interact};
