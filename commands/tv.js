const axios = require('axios');
const User = require('../models/User');

async function tv(author, favoriteMode) {
    const user = await User.findById(author.id).exec();
    if (!favoriteMode) {
        if (!user) {
            return 'You need to set your lichess username with setuser!';
        } else if (!user.favoriteMode) {
            return 'You need to set your favorite gamemode with setgamemode!';
        }
	favoriteMode = user.favoriteMode;
    }
    return axios.get('https://lichess.org/tv/channels')
        .then(response => formatTv(response.data, favoriteMode))
        .catch((err) => {
            console.log(`Error in tv(${author.username}, ${favoriteMode}): \
                ${suffix} ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatTv(data, favoriteMode) {
    for (var channel in data) {
        if (channel.toLowerCase() == favoriteMode)
            return 'https://lichess.org/' + data[channel].gameId;
    }
    return `No channel of mode ${favoriteMode} found!`;
}

function process(bot, msg, favoriteMode) {
    tv(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return tv(interaction.user, interaction.options.favoriteMode);
}

module.exports = {process, reply};
