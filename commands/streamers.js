const axios = require('axios');

async function streamers(author) {
    url = 'https://lichess.org/streamer/live';
    return axios.get(url)
        .then(response => formatStreamers(response.data))
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatStreamers(data) {
    var streamers = [];
    for (var i = 0; i < data.length; i++) {
        streamers.push(data[i].title ? `${data[i].title} ${data[i].name}` : data[i].name);
    }
    return streamers.length ? streamers.join('\n') : 'No streamers are currently live.';
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
