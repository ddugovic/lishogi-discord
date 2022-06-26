const axios = require('axios');
const Discord = require('discord.js');

async function video(author) {
    return axios.get('https://lichess.org/video')
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
    const pattern = /<a class="[ \w]+" href="(\/video\/\w+?\??)">.+?<span class="full-title">([ \w]+)<\/span><span class="author">(\w+)<\/span>/g;
    for (match of document.matchAll(pattern))
        embeds.push(formatVideo(match[1], match[2], match[3]));
    return embeds.length ? { embeds: shuffle(embeds).slice(0, 3) } : 'No video found!';
}

function shuffle(array) {
    return array.sort(() => .5 - Math.random());
}

function formatVideo(link, name, author) {
    return new Discord.MessageEmbed()
        .setAuthor({name: author, iconURL: null, url: 'https://youtube.com/${author}'})
        .setTitle(name)
        .setURL(`https://youtube.com${link}`)
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(name);
}

function process(bot, msg) {
    video(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return video(interaction.user);
}

module.exports = {process, reply};
