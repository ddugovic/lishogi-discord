const axios = require('axios');
const formatPages = require('../lib/format-pages');
const formatLog = require('../lib/format-html');

function log(author, interaction) {
    return axios.get(`https://lichess.org/changelog`)
        .then(response => formatLog(response.data))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in log(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function process(bot, msg) {
    log(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return log(interaction.user, interaction);
}

module.exports = {process, interact};
