const axios = require('axios');
const decode = require('decode-html');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');

function video(author, text, interaction) {
    text = text ? text.replace(/\s+/, '') : '';
    return axios.get(`https://lishogi.org/video?q=${text}`)
        .then(response => setVideos(response.data, interaction))
        .then(embeds => formatPages(embeds, interaction, 'No videos found.'))
        .catch(error => {
            console.log(`Error in video(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setVideos(document, interaction) {
    return getVideos(document).map(video => formatVideo(...video));
}

function getVideos(document) {
    const videos = [];
    const pattern = /<a class="[ \w]+" href="(\/video\/[-\w]+?\??(?:q=\w+)?)"><span class="duration">(.+?)<\/span>.+?<span class="full-title">(.+?)<\/span><span class="author">(.+?)<\/span><span class="target">(.+?)<\/span><span class="tags">(.+?)<\/span>/g;
    for (match of document.matchAll(pattern))
        videos.push([match[1], match[2], match[3], match[4], match[5], match[6]]);
    return videos;
}

function formatVideo(link, duration, name, author, target, tags) {
    const seconds = duration.split(':').reduce((acc,time) => (60 * acc) + +time);
    const score = Math.min(Math.max(Math.floor(2 * Math.sqrt(seconds)), 0), 255);
    return new EmbedBuilder()
        .setColor(formatColor(score, 0, 255-score))
        .setAuthor({name: author, iconURL: null})
        .setTitle(`${decode(name)} (${duration})`)
        .setURL(`https://youtube.com${link}`)
        .setThumbnail(getImage(link))
        .addFields({ name: 'Target', value: title(target), inline: true });
}

function getImage(link) {
    const match = link.match(/\/video\/([-\w]+)\??(?:q=\w+)?/);
    return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
}

function shuffle(array) {
    return array.sort(() => .5 - Math.random());
}

function title(str) {
    return str.split(' ')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, text) {
    video(msg.author, text).then(message => msg.channel.send(message));
}

function interact(interaction) {
    video(interaction.user, interaction.options.getString('text'), interaction);
}

module.exports = {process, interact};
