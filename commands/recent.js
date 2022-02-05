const axios = require('axios');
const User = require('../models/User');

function sendRecentGame(msg, username, rated) {
    // Accept only the x-ndjson type
    axios.get('https://lichess.org/games/export/' + username + '?max=1' + '&rated=' + rated,
        { headers: { 'Accept': 'application/x-ndjson' } })
        .then((response) => {
            var formattedMessage = formatRecentGame(response.data);
            msg.channel.send({ embeds: [formattedMessage] });
        })
        .catch((err) => {
            console.log(`Error in recent: \
                ${username} ${rated} ${err.response.status}  ${err.response.statusText}`);
            msg.channel.send(`An error occured with your request: \
                ${err.response.status} ${err.response.statusText}`);
        });
}

function formatRecentGame(data) {
    return 'https://lichess.org/' + data.id;
}

function process(bot, msg, suffix) {
    var rated = '';
    // test if the user wants a rated, casual game, or most recent
    if (suffix.includes('casual') || suffix.includes('unrated')) {
        rated = 'false';
    }
    else if (suffix.includes('rated')) {
        rated = 'true';
    }
    else {
        rated = '';
    }
    User.findOne({ userId: msg.author.id }, (err, result) => {
        if (err) {
            console.log(err);
            msg.channel.send(`There was an error with your request.`);
        }
        if (!result) {
            msg.channel.send(`You need to set your username with \`setuser\`!`);
        }
        else {
            sendRecentGame(msg, result.lichessName, rated);
        }
    });
}

function reply(interaction) {
    return message;
}

module.exports = {process, reply};
