const { decode } = require('html-entities');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { escape } = require('querystring')

function video(author, text, interaction) {
    const url = `https://lichess.org/video?q=${escape(text)}`
    let status, statusText;
    return fetch(url, { params: { q: text } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => getVideos(text).map(formatVideo))
        .then(embeds => formatPages(shuffle(embeds), interaction, 'No video found.'))
        .catch(error => {
            console.log(`Error in video(${author.username}, ${text}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function getVideos(document) {
    const videos = [];
    const pattern = /<a class="[ \w]+" href="\/video\/([-\w]+)?\??(?:q=[ \w]+)?"><span class="duration">(.+?)<\/span>.+?<span class="full-title">(.+?)<\/span><span class="author">(.+?)<\/span><span class="target">(.+?)<\/span><span class="tags">(.+?)<\/span>/g;
    for (match of document.matchAll(pattern))
        videos.push([match[1], match[2], match[3], match[4], match[5], match[6]]);
    return videos;
}

function formatVideo(video) {
    const [uri, duration, name, author, target, tags] = video;
    const seconds = duration.split(/:/).reduce((acc,time) => (60 * acc) + +time);
    const score = Math.min(Math.max(Math.floor(2 * Math.sqrt(seconds)), 0), 255);
    return new EmbedBuilder()
        .setColor(formatColor(score, 0, 255-score))
        .setAuthor({name: author, iconURL: null})
        .setTitle(`${decode(name)} (${duration})`)
        .setURL(`https://youtu.be/${uri}`)
        .setThumbnail(`https://img.youtube.com/vi/${uri}/0.jpg`)
        .addFields({ name: 'Target', value: title(target), inline: true });
}

function shuffle(array) {
    return array.sort(() => .5 - Math.random());
}

function title(str) {
    return str.split(/ /)
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
