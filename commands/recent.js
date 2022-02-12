const axios = require('axios');
const User = require('../models/User');

async function recent(author, username, suffix) {
    var rated = getRated(suffix);
    const user = await User.findById(author.id).exec();
    if (!username && !user) {
        return 'You need to set your lishogi username with setuser!';
    }
    username = user.lishogiName;
    // Accept only the x-ndjson type
    return axios.get('https://lishogi.org/games/export/' + username + '?max=1' + '&rated=' + rated, { headers: { 'Accept': 'application/x-ndjson' } })
        .then(response => formatRecentGame(response.data))
        .catch((err) => {
            console.log(`Error in recent(${author.username}, ${username}, ${suffix}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatRecentGame(data) {
    return 'https://lishogi.org/' + data.id;
}

function getRated(suffix) {
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
    return rated;
}

function process(bot, msg, suffix) {
    recent(msg.author, '', suffix).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return recent(interaction.user, '', interaction.options.getString('rated'));
}

module.exports = {process, reply};
