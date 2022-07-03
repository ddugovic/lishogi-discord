const axios = require('axios');
const Discord = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const User = require('../models/User');
const Parser = require('rss-parser');

function blog(author, interaction) {
    return new Parser().parseURL('https://lishogi.org/blog.atom')
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
        embeds.push(new Discord.MessageEmbed()
            .setAuthor({name: entry.author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: getLink(entry.author)})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
            .setDescription(formatEntry(entry)));
    }
    if (interaction) {
        const button1 = new Discord.MessageButton()
            .setCustomId('previousbtn')
            .setLabel('Previous')
            .setStyle('SUCCESS');
        const button2 = new Discord.MessageButton()
            .setCustomId('nextbtn')
            .setLabel('Next')
            .setStyle('SUCCESS');
        return paginationEmbed(interaction, embeds, [button1, button2]);
    }
    return { 'embeds': embeds.slice(0, 3) };
}

function getLink(author) {
    for (match of author.matchAll(/@(\w+)/g)) {
        return `https://lishogi.org/@/${match[1]}`;
    }
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
    blog(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return blog(interaction.user, interaction);
}

module.exports = {process, interact};
