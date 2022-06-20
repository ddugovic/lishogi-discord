const axios = require('axios');
const User = require('../models/User');

async function arena(author, favoriteMode) {
    if (!favoriteMode) {
        const user = await User.findById(author.id).exec();
        if (user)
	    favoriteMode = user.favoriteMode;
    }
    const url = 'https://lichess.org/api/tournament';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatArena(response.data, favoriteMode))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatArena(data, favoriteMode) {
    if (favoriteMode) {
        for (var status in data) {
            var arenas = data[status];
            for (var i = 0; i < arenas.length; i++) {
                if (arenas[i].perf.key.toLowerCase() == favoriteMode) {
                    return 'https://lichess.org/tournament/' + arenas[i].id;
                }
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
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return arena(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
