const axios = require('axios');

async function broadcast(author) {
    return axios.get('https://lichess.org/api/broadcast?nb=1', {
            headers: {
                'Content-Type': 'application/vnd.lichess.v3+json',
                'Accept': 'application/x-ndjson'
            }
        })
        .then(response => formatBroadcast(response.data))
        .catch((err) => {
            console.log(`Error in broadcast(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
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
