const axios = require('axios');
const User = require('../models/User');

async function tv(author, mode) {
    const user = await User.findById(author.id).exec();
    if (!mode) {
        if (!user) {
            return 'You need to set your lichess username with setuser!';
        } else if (!user.favoriteMode) {
            return 'You need to set your favorite gamemode with setgamemode!';
        }
	mode = user.favoriteMode;
    }
    return axios.get('https://lichess.org/tv/channels')
        .then(response => formatTv(response.data, mode))
        .catch((err) => {
            console.log(`Error in tv(${author.username}, ${mode}): \
                ${suffix} ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatTv(data, mode) {
    for (var channel in data) {
        if (channel.toLowerCase() == mode)
            return 'https://lichess.org/' + data[channel].gameId;
    }
    return `No channel of mode ${mode} found!`;
}

function process(bot, msg, mode) {
    tv(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return tv(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
