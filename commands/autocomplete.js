const { decode } = require('html-entities');
const formatError = require('../lib/format-error');
const { escape } = require('querystring')

function autocomplete(author, text) {
    if (text.length < 3) {
        return [];
    }
    const url = `https://lichess.org/api/player/autocomplete?object=true&term=${escape(text)}`;
    let status, statusText;
    return fetch(url, { params: { q: text } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => json.result.map(user => ({ name: user.name, value: user.id })))
        .catch(error => {
            console.log(`Error in autocomplete(${author.id}, ${text}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function process(bot, msg, text) {
    autocomplete(msg.author, text).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const focusedValue = interaction.options.getFocused();
    interaction.respond(await autocomplete(interaction.user, interaction.options.getString('text'), interaction));
}

module.exports = {process, interact};
