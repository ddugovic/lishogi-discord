const axios = require('axios');

async function simul(author) {
    const url = 'https://lidraughts.org/api/simul';
    return axios.get(url, { headers: { Accept: 'application/vnd.lidraughts.v3+json' } })
        .then(response => formatSimul(response.data))
        .catch((err) => {
            console.log(`Error in simul(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatSimul(data) {
    for ([key, simuls] of Object.entries(data)) {
        if (simuls.length)
            return `https://lidraughts.org/simul/${simuls[0].id}`;
    }
    return 'No events found!';
}

function process(bot, msg) {
    simul(msg.author).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return simul(interaction.user);
}

module.exports = {process, reply};
