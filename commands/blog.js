const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');
const { read } = require('feed-reader/dist/cjs/feed-reader.js')

async function blog(author) {
    return read('https://playstrategy.org/blog.atom')
        .then(feed => formatBlog(feed))
        .catch(error => {
            console.log(error)
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBlog(blog) {
    const entry = blog.entries[0];
    const embed = new Discord.MessageEmbed()
        .setAuthor({name: blog.title, iconURL: 'https://playstrategy.org/assets/logo/playstrategy-favicon-32-invert.png', url: blog.link})
        .setTitle(entry.title)
        .setURL(entry.link)
        .setThumbnail('https://playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setDescription(entry.description);
    return { embeds: [ embed ] };
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return blog(interaction.user);
}

module.exports = {process, reply};
