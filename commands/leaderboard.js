const axios = require('axios');
const User = require('../models/User');

async function leaderboard(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = `https://lichess.org/player/top/1/${mode ?? 'blitz'}`;
    console.log(url);
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => formatLeaderboard(response.data))
        .catch((err) => {
            console.log(`Error in leaderboard(${author.username}, ${mode}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.favoriteMode;
}

function formatLeaderboard(data) {
    if (data.users[0]) {
        return 'https://lichess.org/@/' + data.users[0].username;
    }
    return 'Leader not found!'
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
