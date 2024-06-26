const { formatError, formatPages } = require('../lib/format-pages');
const { formatLog } = require('../lib/format-html');

function log(author, interaction) {
    let status, statusText;
    const url = 'https://lishogi.org/changelog';
    return fetch(url)
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => formatLog(text))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in log(${author.username}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
        });
}

function process(bot, msg) {
    log(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return log(interaction.user, interaction);
}

module.exports = {process, interact};
