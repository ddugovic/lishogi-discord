const axios = require('axios');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = 'https://lichess.org/tv/channels';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatTv(response.data, mode ?? 'blitz'))
        .catch(error => {
            console.log(`Error in tv(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.favoriteMode;
}

function formatTv(data, mode) {
    for (channel in data) {
        if (channel.toLowerCase() == mode.toLowerCase())
            return `https://lichess.org/${data[channel].gameId}`;
    }
    return `Channel not found!`;
}

function process(bot, msg, mode) {
    tv(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return tv(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
