const axios = require('axios');
const User = require('../models/User');

async function gif(author, username) {
    if (!username)
        username = await getName(author);
    const url = `https://playstrategy.org/api/user/${username}/current-game?moves=false`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatCurrent(response.data))
        .catch((err) => {
            console.log(`Error in gif(${author.username}, ${username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.playstrategyName;
}

function formatCurrent(data) {
    return `https://assets.playstrategy.org/game/export/gif/${data.id}.gif`;
}

function process(bot, msg, username) {
    gif(msg.author, username).then(message => msg.channel.send(message));
}

function reply(interaction) {
    return gif(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
