const axios = require('axios');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        const user = await User.findById(author.id).exec();
        if (!username && !user) {
            return 'You need to set your lidraughts username with setuser!';
        }
        username = user.lidraughtsName;
    }
    url = `https://lidraughts.org/api/user/${username}/current-game?moves=false&tags=false&clocks=false&evals=false&opening=false`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatCurrent(response.data))
        .catch((err) => {
            console.log(`Error in playing(${author.username}, ${username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatCurrent(data) {
    return 'https://lidraughts.org/' + data.id;
}

function process(bot, msg, username) {
    playing(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
