const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');
const { read } = require('feed-reader/dist/cjs/feed-reader.js')

async function blog(author) {
    return read('https://lishogi.org/blog.atom')
        .then(feed => formatBlog(feed))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBlog(blog) {
    const entry = blog.entries[0];
    const author = entry.author ?? blog.title;
    const link = getLink(author) ?? blog.link;
    const embed = new Discord.MessageEmbed()
        .setAuthor({name: blog.title, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: link})
        .setTitle(entry.title)
        .setURL(entry.link)
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setDescription(entry.description);
    return { embeds: [ embed ] };
}

function getLink(author) {
    for (match of author.matchAll(/@(\w+)/g)) {
        return `https://lishogi.org/@/${match[1]}`;
    }
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return blog(interaction.user);
}

module.exports = {process, reply};
