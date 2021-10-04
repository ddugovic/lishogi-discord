const axios = require('axios');

// Send ongoing broadcast info
function formatBroadcast(data) {
    return data['tour']['url'];
}

function broadcast(bot, msg) {
    axios.get('https://lichess.org/api/broadcast?nb=1')
        .then((response) => {
            var formattedMessage = formatBroadcast(response.data);
            msg.channel.send(formattedMessage);
        })
        .catch((err) => {
            console.log(`Error in sendBroadcast: \
                ${suffix} ${err.response.status}  ${err.response.statusText}`);
            msg.channel.send(`An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`);
        });
}

module.exports = broadcast;
