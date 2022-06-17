const axios = require('axios');
const Discord = require('discord.js');

async function streamers(author) {
    return axios.get('https://lichess.org/streamer/live')
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
            .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
            .setTitle(`:satellite: Lichess Streamers`)
            .setURL('https://lichess.org/streamer')
            .addFields(data.map(formatStreamer));
        return { embeds: [ embed ] };
    } else {
        return 'No streamers are currently live.';
    }
}

function formatStreamer(streamer) {
    const name = formatName(streamer);
    const badges = streamer.patron ? '🦄' : '';
    return { name : `${name} ${badges}`, value: `[Profile](https://lichess.org/@/${streamer.name})`, inline: true };
}

function formatName(streamer) {
    return streamer.title ? `**${streamer.title}** ${streamer.name}` : streamer.name;
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
