const axios = require('axios');
const User = require('../models/User');

function sendTv(msg, favoriteMode) {
    axios.get('https://lichess.org/tv/channels')
        .then((response) => {
            var formattedMessage = formatTv(response.data, favoriteMode);
            msg.channel.send({ embeds: [formattedMessage] });
        })
        .catch((err) => {
            console.log(`Error in tv: \
                ${favoriteMode} ${err.response.status} ${err.response.statusText}`);
            msg.channel.send(`An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`);
        });
}

function formatTv(data, favoriteMode) {
    for (var channel in data) {
        if (channel.toLowerCase() == favoriteMode)
            return 'https://lichess.org/' + data[channel].gameId;
    }
    console.log(data)
    return `No channel of mode ${favoriteMode} found!`;
}

function process(bot, msg, favoriteMode) {
    if (favoriteMode) {
        sendTv(msg, favoriteMode);
    } else {
        User.findOne({ userId: msg.author.id }, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (!result) {
                msg.channel.send('You need to set your lichess username with setuser!');
            } else if (!result.favoriteMode) { 
                msg.channel.send('You need to set your favorite gamemode with setgamemode!');
            } else {
                sendTv(msg, result.favoriteMode);
            }
        });
    }
}

function reply(interaction) {
    return message;
}

module.exports = {process, reply};
