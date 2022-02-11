const axios = require('axios');

function formatBroadcast(data) {
    return data['tour']['url'];
}

async function broadcast() {
    return axios.get('https://lishogi.org/api/broadcast?nb=1')
        .then(response => formatBroadcast(response.data))
        .catch((err) => {
            console.log(`Error in sendBroadcast: \
                ${suffix} ${err.response.status} ${err.response.statusText}`);
            return `An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function process(bot, msg) {
    broadcast().then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return broadcast();
}

module.exports = {process, reply};
