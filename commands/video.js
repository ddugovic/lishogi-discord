const axios = require('axios');
const decode = require('decode-html');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');

async function video(author, text) {
    text = text ? text.replace(/\s+/, '') : '';
    return axios.get(`https://lichess.org/video?q=${text}`)
        .then(response => setVideos(response.data))
        .catch(error => {
            console.log(`Error in video(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setVideos(document) {
    const embeds = [];
    const pattern = /<a class="[ \w]+" href="(\/video\/\w+?\??(?:q=\w+)?)">.+?<span class="duration">(.+?)<\/span>.+?<span class="full-title">(.+?)<\/span><span class="author">(.+?)<\/span>/g;
    for (match of document.matchAll(pattern))
        embeds.push(formatVideo(match[1], match[2], match[3], match[4]));
    return embeds.length ? { embeds: shuffle(embeds).slice(0, 3) } : 'No video found!';
}

function formatVideo(link, duration, title, author) {
    const seconds = duration.split(':').reduce((acc,time) => (60 * acc) + +time);
    const score = Math.min(Math.max(Math.floor(2 * Math.sqrt(seconds)), 0), 255);
    return new Discord.MessageEmbed()
        .setColor(formatColor(score, 0, 255-score))
        .setAuthor({name: author, iconURL: null})
        .setTitle(`${decode(title)} (${duration})`)
        .setURL(`https://youtube.com${link}`)
        .setThumbnail(getImage(link));
}

function getImage(link) {
    const match = link.match(/\/video\/(\w+)\??(?:q=\w+)?/);
    return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
}

function shuffle(array) {
    return array.sort(() => .5 - Math.random());
}

function process(bot, msg, text) {
    video(msg.author, text).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return video(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
