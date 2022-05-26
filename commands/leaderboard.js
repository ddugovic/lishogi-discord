const axios = require('axios');
const User = require('../models/User');

async function leaderboard(author, mode) {
    const user = await User.findById(author.id).exec();
    if (!mode) {
        if (!user) {
            return 'You need to set your lidraughts username with setuser!';
        } else if (!user.favoriteMode) {
            return 'You need to set your favorite gamemode with setgamemode!';
        }
	mode = user.favoriteMode;
    }
    url = `https://lidraughts.org/player/top/1/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lidraughts.v3+json' } })
        .then(response => formatLeaderboard(response.data))
        .catch((err) => {
            console.log(`Error in leaderboard(${author.username}, ${mode}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatLeaderboard(data) {
    return 'https://lidraughts.org/@/' + data.users[0].username;
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
