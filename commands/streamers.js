const axios = require('axios');

async function streamers() {
    return axios.get('https://api.woogles.io/pub/streamers')
        .then(response => formatStreamers(response.data))
        .catch(error => {
            console.log(`Error in streamers(): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
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
    streamers(mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    interaction.deferReply().then(interaction.editReply(await streamers()));
}

module.exports = {process, interact};
