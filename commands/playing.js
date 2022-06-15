const axios = require('axios');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.wooglesName) {
            return 'You need to set your woogles username with setuser!';
        }
        username = user.wooglesName;
    }
    url = `https://woogles.io/twirp/game_service.GameMetadataService/GetRecentGames`;
    const request = {
        'username': username,
        'numGames': 1,
        'offset': 0
    };
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, request, {headers: context})
        .then(response => formatGames(response.data))
        .catch((err) => {
            console.log(`Error in playing(${author.username}, ${username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatGames(data) {
    for (info of data.game_info) {
        return `https://woogles.io/${info.game_id}`;
    }
    return 'No games found!';
}

function process(bot, msg, username) {
    playing(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
