const axios = require('axios');

async function streamers(author) {
    return axios.get('https://api.woogles.io/pub/streamers')
        .then(response => formatStreamers(response.data))
        .catch((err) => {
            console.log(`Error in streamers(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatStreamers(data) {
    streamers = [];
    for (var i = 0; i < data.streamers.length; i++) {
        if (data.streamers[i].is_live) {
            streamers.push(`<${data.streamers[i].twitch_url}>`);
        }
    }
    return streamers.sort().join('\n');
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    interaction.editReply(await streamers(interaction.user));
}

module.exports = {process, interact};
