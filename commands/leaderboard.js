const axios = require('axios');
const User = require('../models/User');

async function leaderboard(author, mode) {
    var favoriteMode = mode;
    if (!mode) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.chessName) {
            return 'You need to set your chess.com username with setuser!';
        }
        favoriteMode = user.favoriteMode;
    }
    url = 'https://api.chess.com/pub/leaderboards';
    return axios.get(url)
        .then(response => formatLeaderboard(response.data, favoriteMode))
        .catch((err) => {
            console.log(`Error in leaderboard(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatLeaderboard(data, mode) {
    if (mode && data[mode]) {
        return data[mode][0].url;
    } else {
        return data['live_blitz'][0].url;
    }
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
