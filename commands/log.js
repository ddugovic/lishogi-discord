const formatPages = require('../lib/format-pages');
const { formatLog } = require('../lib/format-html');

function log(user, interaction) {
    let status, statusText;
    return fetch(`https://lidraughts.org/changelog`)
	.then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => formatLog(text))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in log(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function process(bot, msg) {
    log(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return log(interaction.user, interaction);
}

module.exports = {process, interact};
