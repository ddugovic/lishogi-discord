const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const formatTable = require('../lib/format-table');
const html2md = require('html-to-md');
const parseDocument = require('../lib/parse-document');

function broadcast(user, interaction) {
    const url = 'https://playstrategy.org/api/broadcast';
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
        .setAuthor({name: broadcast.tour.name, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png'})
        .setTitle(broadcast.tour.description)
        .setURL(broadcast.tour.url)
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setDescription(formatDescription(broadcast.tour.markup))
        .addFields({ name: 'Rounds', value: broadcast.rounds.sort((a,b) => a.startsAt - b.startsAt).map(formatRound).join('\n') });
}

function formatDescription(text) {
    text = html2md(text)
    const pattern = /(\|(?:[-,\. \w]+\|)+)\r?\n\|(?:-+\|)+((?:\r?\n\|(?:[-,\. \w]+\|)+)+)/;
    const match = text.match(pattern);
    if (match)
        text = text.replace(match[0], formatTable(match[1], match[2].trim()))
    return text;
}

function formatRound(round) {
    return `<t:${round.startsAt / 1000}:R> ${round.name}`;
}

function process(bot, msg) {
    broadcast(msg.author).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return broadcast(interaction.user);
}

module.exports = {process, reply};
