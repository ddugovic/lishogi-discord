const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');

async function news(author) {
    url = 'https://woogles.io/twirp/config_service.ConfigService/GetAnnouncements';
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, {}, {headers: context})
        .then(response => formatAnnouncement(response.data))
        .catch((error) => {
            console.log(`Error in announcement(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatAnnouncement(data) {
    const announcement = data.announcements[0];
    const link = formatLink(announcement.link);
    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setTitle(announcement.title)
        .setURL(link)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(announcement.body);
    console.log(embed);
    return { embeds: [ embed ] };
}

function formatLink(link) {
    return link.startsWith('/') ? `https://woogles.io${link}` : link;
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return news(interaction.user);
}

module.exports = {process, reply};
