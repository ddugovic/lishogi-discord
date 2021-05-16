const axios = require('axios');
const User = require('../models/User');

// Send ongoin game info
function sendCurrent(msg, username) {
    axios.get('https://lishogi.org/api/user/' + username)
        .then((response) => {
            var formattedMessage = formatCurrent(response.data);
            msg.channel.send(formattedMessage);
        })
        .catch((err) => {
            console.log(`Error in playing: \
                ${suffix} ${err.response.status}  ${err.response.statusText}`);
            msg.channel.send(`An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`);
        });
}

function formatCurrent(data) {
    var formattedMessage;
    if (data.playing) {
        formattedMessage = data.playing;
    }
    else {
        formattedMessage = "No current games found!";
    }
    return formattedMessage;
}

function playing(bot, msg, suffix) {
    if (suffix) {
        sendCurrent(msg, suffix);
    }
    else {
        // Send name.
        User.findOne({ playerId: msg.author.id }, (err, result) => {
            if (err) {
                console.log(err);
                msg.channel.send(`There was an error with your request.`);
            }
            if (!result) {
                msg.channel.send(`You need to set your lishogi username with \`setuser\`!`);
            } else {
                sendCurrent(msg, result.lishogiName);
            }
        });
    }
}

module.exports = playing;
