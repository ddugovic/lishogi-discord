const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');
const Parser = require('rss-parser');

async function blog(author) {
    return new Parser().parseURL('https://lidraughts.org/blog.atom')
        .then(feed => formatBlog(feed))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBlog(blog) {
    const entry = blog.items[0];
    const link = getLink(entry.author);
    const embed = new Discord.MessageEmbed()
        .setAuthor({name: entry.author, iconURL: 'https://lidraughts.org/assets/images/favicon-32-black.png', url: link})
        .setTitle(entry.title)
        .setURL(entry.link)
        .setThumbnail('https://lidraughts.org/assets/favicon.64.png')
        .setDescription(formatEntry(entry));
    return { embeds: [ embed ] };
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
        return `https://lidraughts.org/@/${match[1]}`;
    }
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return blog(interaction.user);
}

module.exports = {process, reply};
