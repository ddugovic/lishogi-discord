const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatMarkup } = require('../lib/format-html');
const formatPages = require('../lib/format-pages');
const parseDocument = require('../lib/parse-document');

function broadcast(user, interaction) {
    const url = 'https://lidraughts.org/api/broadcast';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
	.then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => parseDocument(json).map(formatBroadcast))
        .then(embeds => formatPages(embeds, interaction, 'No broadcast found!'))
        .catch(error => {
            console.log(`Error in broadcast(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatBroadcast(broadcast) {
    const red = Math.min(broadcast.rounds.length * 20, 255);
    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({ name: broadcast.tour.name, iconURL: 'https://lidraughts.org/assets/images/favicon-32-black.png' })
        .setTitle(broadcast.tour.description)
        .setURL(broadcast.tour.url)
        .setThumbnail('https://lidraughts.org/assets/favicon.64.png')
        .setDescription(formatMarkup(broadcast.tour.markup))
        .addFields({ name: 'Rounds', value: broadcast.rounds.sort((a,b) => a.startsAt - b.startsAt).map(formatRound).join('\n') });
}

function formatRound(round) {
    return `<t:${round.startsAt / 1000}> – ${round.name} *<t:${round.startsAt / 1000}:R>*`;
}

function process(bot, msg) {
    broadcast(msg.author).then(message => msg.channel.send(message));
}

function reply(interaction) {
    return broadcast(interaction.user);
}

module.exports = {process, reply};
