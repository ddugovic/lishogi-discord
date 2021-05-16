const axios = require('axios');
const User = require('../models/User');

// Send ongoing game info
function sendArena(msg, suffix, favoriteMode) {
    axios.get('https://lishogi.org/api/tournament')
        .then((response) => {
            var formattedMessage = formatArena(response.data, suffix, favoriteMode);
            msg.channel.send(formattedMessage);
        })
        .catch((err) => {
            console.log(`Error in sendArena: \
                ${suffix} ${err.response.status}  ${err.response.statusText}`);
            msg.channel.send(`An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`);
        });
}

function formatArena(data, createdBy, favoriteMode) {
    for (var status in data) {
        var arenas = data[status];
        for (var i = 0; i < arenas.length; i++) {
            if (arenas[i].variant.key.toLowerCase() == favoriteMode &&
                arenas[i].createdBy == createdBy) {
                return 'https://lishogi.org/tournament/' + arenas[i].id;
            }
        }
    }
    for (var status in data) {
        var arenas = data[status];
        for (var i = 0; i < arenas.length; i++) {
            if (arenas[i].createdBy == createdBy)
                return 'https://lishogi.org/tournament/' + arenas[i].id;
        }
    }
    return 'No tournament created by ' + createdBy + ' found!';
}

function arena(bot, msg, suffix) {
    User.findOne({ playerId: msg.author.id }, (err, result) => {
        var favoriteMode = '';
        if (err) {
            console.log(err);
        }
        favoriteMode = result.favoriteMode;
        if (suffix) {
            sendArena(msg, suffix, favoriteMode);
        } else {
            sendArena(msg, 'lishogi', favoriteMode);
        }
    });
}

module.exports = arena;
