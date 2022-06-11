const axios = require('axios');

async function leaderboard(author) {
    url = 'https://api.chess.com/pub/leaderboards';
    return axios.get(url)
        .then(response => formatLeaderboard(response.data))
        .catch((err) => {
            console.log(`Error in leaderboard(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatLeaderboard(data) {
    return data.daily[0].url;
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
