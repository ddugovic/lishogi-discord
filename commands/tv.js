const User = require('../models/User');

async function tv(author, mode) {
    if (!mode) {
        const user = await User.findById(author.id).exec();
        mode = (user && user.favoriteMode) ? user.favoriteMode : 'blitz';
    }
    const url = 'https://lidraughts.org/tv/channels';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/vnd.lidraughts.v3+json' } })
	.then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatTv(json, mode))
        .catch((err) => {
            console.log(`Error in tv(${author.username}, ${mode}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatTv(data, mode) {
    for (channel in data) {
        if (channel.toLowerCase() == mode.toLowerCase())
            return `https://lidraughts.org/${data[channel].gameId}`;
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
