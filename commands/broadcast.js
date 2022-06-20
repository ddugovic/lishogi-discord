const axios = require('axios');

async function broadcast(author) {
    url = 'https://lichess.org/api/broadcast?nb=1';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatBroadcast(response.data))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): \
                ${error.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${err.response.statusText}`;
        });
}

function formatBroadcast(data) {
    return data['tour']['url'];
}

function process(bot, msg) {
    broadcast(msg.author).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return broadcast(interaction.user);
}

module.exports = {process, reply};
