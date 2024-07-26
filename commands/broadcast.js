const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatMarkup } = require('../lib/format-html');
const { formatPages } = require('../lib/format-pages');
const parseDocument = require('../lib/parse-document');

function broadcast(author, interaction) {
    const url = 'https://lishogi.org/api/broadcast';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseDocument(text).map(formatBroadcast))
        .then(embeds => formatPages('Broadcast', embeds, interaction, 'No broadcast found!'))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatBroadcast(broadcast) {
    const red = Math.min(broadcast.rounds.length * 20, 255);
    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({ name: broadcast.tour.name, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png' })
        .setTitle(broadcast.tour.description)
        .setURL(broadcast.tour.url)
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setDescription(formatMarkup(broadcast.tour.markup))
        .addFields({ name: 'Rounds', value: formatRounds(broadcast.rounds) });
}

function formatRound(round) {
    return `<t:${round.startsAt / 1000}> – ${round.name} *<t:${round.startsAt / 1000}:R>*`;
}

function formatRounds(rounds) {
    let schedule = rounds.sort((a,b) => a.startsAt - b.startsAt).map(formatRound);
    while (schedule.join('\n').length > 1024)
	schedule.pop();
    return schedule.join('\n');
}

function process(bot, msg) {
    broadcast(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return broadcast(interaction.user, interaction);
}

module.exports = {process, interact};
