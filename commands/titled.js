const axios = require('axios');
const User = require('../models/User');

async function titled(author, title) {
    const url = `https://api.chess.com/pub/titled/${title}`;
    return axios.get(url)
        .then(response => formatPlayers(response.data))
        .catch((error) => {
            console.log(`Error in titled(${author.username}, ${title}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatPlayers(data) {
    const players = data.players;
    const username = players[Math.floor(Math.random() * players.length)];
    return `https://www.chess.com/member/${username}`;
}

function process(bot, msg, title) {
    titled(msg.author, title).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return titled(interaction.user, interaction.options.getString('title'));
}

module.exports = {process, reply};
