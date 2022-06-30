const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');
const Parser = require('rss-parser');

async function blog(author) {
    return new Parser().parseURL('https://playstrategy.org/blog.atom')
        .then(feed => formatBlog(feed))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBlog(blog) {
    const embeds = [];
    for (const entry of blog.items.values()) {
        embeds.push(new Discord.MessageEmbed()
            .setAuthor({name: entry.author, iconURL: 'https://playstrategy.org/assets/logo/playstrategy-favicon-32-invert.png', url: getLink(entry.author)})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setThumbnail('https://assets.playstrategy.org/assets/logo/playstrategy-favicon-64.png')
            .setDescription(formatEntry(entry)));
    }
    return { 'embeds': embeds.slice(0, 3) };
}

function getLink(author) {
    for (match of author.matchAll(/@(\w+)/g)) {
        return `https://playstrategy.org/@/${match[1]}`;
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

async function reply(interaction) {
    return blog(interaction.user);
}

module.exports = {process, reply};
