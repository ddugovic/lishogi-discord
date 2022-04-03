const axios = require('axios');
const User = require('../models/User');

async function arena(author, favoriteMode) {
    const user = await User.findById(author.id).exec();
    if (!favoriteMode) {
        if (!user) {
            return 'You need to set your lichess username with setuser!';
        } else if (!user.favoriteMode) {
            return 'You need to set your favorite gamemode with setgamemode!';
        }
	favoriteMode = user.favoriteMode;
    }
    return axios.get('https://lichess.org/api/tournament', {
            headers: {
                'Content-Type': 'application/vnd.lichess.v3+json',
                'Accept': 'application/x-ndjson'
            }
        })
        .then(response => formatArena(response.data, favoriteMode))
        .catch((err) => {
            console.log(`Error in arena(${author.username}, ${favoriteMode}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatArena(data, favoriteMode) {
    for (var status in data) {
        var arenas = data[status];
        for (var i = 0; i < arenas.length; i++) {
            if (arenas[i].variant.key.toLowerCase() == favoriteMode) {
                return 'https://lichess.org/tournament/' + arenas[i].id;
            }
        }
    }
    for (var status in data) {
        var arenas = data[status];
        for (var i = 0; i < arenas.length; i++) {
            return 'https://lichess.org/tournament/' + arenas[i].id;
        }
    }
    return 'No tournament found!';
}

function process(bot, msg, favoriteMode) {
    arena(msg.author, '', favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return arena(interaction.user, '', interaction.options.getString('favoriteMode'));
}

module.exports = {process, reply};
