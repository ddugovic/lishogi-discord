const axios = require('axios');

async function puzzle(author, favoriteMode) {
    url = 'https://api.woogles.io/pub/puzzle';
    return axios.get(url)
        .then(response => formatPuzzle(response.data, favoriteMode))
        .catch((err) => {
            console.log(`Error in puzzle(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatPuzzle(data) {
    return data.url;
}

function process(bot, msg) {
    puzzle(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return puzzle(interaction.user);
}

module.exports = {process, reply};
