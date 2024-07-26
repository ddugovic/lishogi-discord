const formatError = require('../lib/format-error');
const { formatLog } = require('../lib/format-html');
const { formatPages } = require('../lib/format-pages');

function log(author, interaction) {
    let status, statusText;
    const url = 'https://lishogi.org/changelog';
    return fetch(url)
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => formatLog(text))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in log(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function process(bot, msg) {
    log(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return log(interaction.user, interaction);
}

module.exports = {process, interact};
