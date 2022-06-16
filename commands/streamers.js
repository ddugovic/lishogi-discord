const axios = require('axios');
const Discord = require('discord.js');

async function streamers(author) {
    return axios.get('https://lidraughts.org/streamer/live')
        .then(response => setStreamers(response.data))
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setStreamers(data) {
    if (data.length) {
        const embed = new Discord.MessageEmbed()
            .setColor(0xFFFFFF)
            .setThumbnail('https://lidraughts.org/assets/favicon.64.png')
            .setTitle(`:satellite: Lidraughts Streamers`)
            .setURL('https://lidraughts.org/streamer')
            .addFields(formatStreamers(data));
        return { embeds: [ embed ] };
    } else {
        return 'No streamers are currently live.';
    }
}

function formatStreamers(data) {
    var streamers = [];
    for (streamer of data) {
        const name = formatName(streamer);
        const badges = data.patron ? '⛃' : '';
        streamers.push({ name : `${name} ${badges}`, value: `[Profile](https://lidraughts.org/@/${streamer.name})`, inline: true })
    }
    return streamers;
}

function formatName(streamer) {
    return streamer.title ? `${streamer.title} ${streamer.name}` : streamer.name;
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
