const formatError = require('../lib/format-error');
const { escape } = require('querystring')

function autocomplete(author, text) {
    if (text.length < 3) {
        return [];
    }
    const url = `https://lichess.org/api/player/autocomplete?object=true&term=${escape(text)}`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => json.result.map(user => ({ name: formatUser(user), value: user.id })))
        .catch(error => {
            console.log(`Error in autocomplete(${author.id}, ${text}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatUser(user) {
    const badge = user.patron ? '🦄' : '';
    const name = user.title ? `${user.title} ${user.name}` : user.name;
    const status = user.online ? ' 📶 Online' : '';
    return `${badge}${name}${status}`;
}

function process(bot, msg, text) {
    autocomplete(msg.author, text).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    interaction.respond(await autocomplete(interaction.user, interaction.options.getFocused()));
}

module.exports = {process, interact};
