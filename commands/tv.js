const axios = require('axios');
const User = require('../models/User');

function sendTv(msg, favoriteMode) {
    axios.get('https://lishogi.org/tv/channels')
        .then((response) => {
            var formattedMessage = formatTv(response.data, favoriteMode);
            msg.channel.send(formattedMessage);
        })
        .catch((err) => {
            console.log(`Error in tv: \
                ${suffix} ${err.response.status}  ${err.response.statusText}`);
            msg.channel.send(`An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`);
        });
}

function formatTv(data, favoriteMode) {
    for (var channel in data) {
        if (channel.toLowerCase() == favoriteMode)
            return 'https://lishogi.org/' + data[channel].gameId;
    }
    console.log(data)
    return `No channel of mode ${favoriteMode} found!`;
}

function tv(bot, msg, suffix) {
    if (suffix) {
        sendTv(msg, suffix);
    } else {
        User.findOne({ userId: msg.author.id }, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (!result) {
                msg.channel.send('You need to set your lishogi username with setuser!');
            } else if (!result.favoriteMode) { 
                msg.channel.send('You need to set your favorite gamemode with setgamemode!');
            } else {
                sendTv(msg, result.favoriteMode);
            }
        });
    }
}

module.exports = tv;
