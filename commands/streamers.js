const axios = require('axios');

async function streamers(author) {
    return axios.get('https://api.chess.com/pub/streamers')
        .then(response => formatStreamers(filter(response.data)) || 'No streamers are currently live.')
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function filter(streamer) {
    return streamer.is_live;
}

function formatStreamers(data) {
    if (streamers)
        return streamers.map(streamer => `<${streamer.twitch_url}>`).join('\n');
}

function process(bot, msg) {
    streamers(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
