const axios = require('axios');
const User = require('../models/User');

async function arena(author, favoriteMode) {
    const user = await User.findById(author.id).exec();
    if (!favoriteMode) {
        if (!user) {
            return 'You need to set your lishogi username with setuser!';
        } else if (!user.favoriteMode) {
            return 'You need to set your favorite gamemode with setgamemode!';
        }
	favoriteMode = user.favoriteMode;
    }
    url = 'https://lishogi.org/api/tournament';
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
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
                return 'https://lishogi.org/tournament/' + arenas[i].id;
            }
        }
    }
    for (var status in data) {
        var arenas = data[status];
        for (var i = 0; i < arenas.length; i++) {
            return 'https://lishogi.org/tournament/' + arenas[i].id;
        }
    }
    return 'No tournament found!';
}

function process(bot, msg, favoriteMode) {
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return arena(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
