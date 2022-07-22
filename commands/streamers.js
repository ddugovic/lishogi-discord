const ChessWebAPI = require('chess-web-api');
const { EmbedBuilder } = require('discord.js');
const formatPages = require('../lib/format-pages');

function streamers(author, interaction) {
    return new ChessWebAPI().getStreamers()
        .then(response => getLiveStreamers(response.body.streamers))
        .then(streamers => streamers.map(formatStreamer))
        .then(embeds => formatPages(embeds, interaction, 'No streamers are currently live.'))
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function getLiveStreamers(streamers) {
    return streamers.filter(streamer => streamer.is_live);
}

function formatStreamer(streamer) {
    return new EmbedBuilder()
        .setTitle(streamer.username)
        .setThumbnail(streamer.avatar)
        .setURL(streamer.twitch_url)
        .setDescription(`Watch ${streamer.username} live on Twitch!`);
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    streamers(interaction.user, interaction);
}

module.exports = {process, interact};
