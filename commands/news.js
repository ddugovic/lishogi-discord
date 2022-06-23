const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');

async function news(author) {
    const url = 'https://woogles.io/twirp/config_service.ConfigService/GetAnnouncements';
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, {}, {headers: context})
        .then(response => setAnnouncements(response.data))
        .catch((error) => {
            console.log(`Error in announcement(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setAnnouncements(data) {
    return formatAnnouncement(data.announcements[0]);
}

function formatAnnouncement(announcement) {
    const [description, imageURL] = formatBody(announcement.body);
    const embed = new Discord.MessageEmbed()
        .setAuthor({name: 'Woogles', iconURL: 'https://woogles.io/logo192.png', url: 'https://woogles.io/'})
        .setColor(0x00FFFF)
        .setTitle(announcement.title)
        .setURL(formatLink(announcement.link))
        .setThumbnail(imageURL ?? 'https://woogles.io/logo192.png')
        .setDescription(description);
    return { embeds: [ embed ] };
}

function formatBody(body) {
    const pattern = /!\[\w+\]\((.*)\)\s+(.*)/;
    const match = body.match(pattern);
    if (match)
        return [match[2], match[1]];
    return [body, null];
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
