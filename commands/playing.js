const axios = require('axios');
const User = require('../models/User');

async function playing(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username && !user) {
        return 'You need to set your lichess username with setuser!';
    }
    username = user.lichessName;
    return axios.get('https://lichess.org/api/user/' + username)
        .then(response => formatGames(response.data))
        .catch((err) => {
            console.log(`Error in playing(${author.username}, ${username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatGames(data) {
    var formattedMessage;
    if (data.playing) {
        formattedMessage = data.playing;
    }
    else {
        formattedMessage = "No current games found!";
    }
    return formattedMessage;
}

function process(bot, msg, username) {
    playing(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
