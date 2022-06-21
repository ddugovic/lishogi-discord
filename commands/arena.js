const axios = require('axios');
const User = require('../models/User');

async function arena(author, mode) {
    if (!mode) {
        const user = await User.findById(author.id).exec();
        if (user)
	    mode = user.favoriteMode;
    }
    const url = 'https://playstrategy.org/api/tournament';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setArena(response.data, mode))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function setArena(data, mode) {
    if (mode) {
        for (var status in data) {
            const arenas = data[status].filter(arena => arena.perf.key.toLowerCase() == mode);
            if (arenas.length)
                return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
        }
    }
    for (var status in data) {
        const arenas = data[status];
        if (arenas.length)
            return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
    }
    return 'No tournament found!';
}

function formatArena(arena) {
    return `https://playstrategy.org/tournament/${arena.id}`;
}


function process(bot, msg, favoriteMode) {
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return arena(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
