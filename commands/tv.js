const axios = require('axios');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode) {
        const user = await User.findById(author.id).exec();
        mode = (user && user.favoriteMode) ? user.favoriteMode : 'blitz';
    }
    url = 'https://lishogi.org/tv/channels';
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
        .then(response => formatTv(response.data, mode))
        .catch((err) => {
            console.log(`Error in tv(${author.username}, ${mode}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatTv(data, mode) {
    for (var channel in data) {
        if (channel.casefold() == mode.casefold())
            return 'https://lishogi.org/' + data[channel].gameId;
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
