const axios = require('axios');
const Discord = require('discord.js');

async function video(author, text) {
    text = text.replace(/\s+/, '');
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
    const pattern = /<a class="[ \w]+" href="(\/video\/\w+?\??(?:q=\w+)?)">.+?<span class="full-title">(.+?)<\/span><span class="author">([ \w]+?)<\/span>/g;
    for (match of document.matchAll(pattern))
        embeds.push(formatVideo(match[1], match[2], match[3]));
    return embeds.length ? { embeds: shuffle(embeds).slice(0, 3) } : 'No video found!';
}

function formatVideo(link, name, author) {
    return new Discord.MessageEmbed()
        .setAuthor({name: author, iconURL: null})
        .setTitle(name)
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
