const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const formatTable = require('../lib/format-table');
const html2md = require('html-to-md');
const parse = require('ndjson-parse');

function broadcast(author, interaction) {
    const url = 'https://lichess.org/api/broadcast';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatDocument(response.data).map(formatBroadcast))
        .then(embeds => formatPages(embeds, interaction, 'No broadcast found!'))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatDocument(document) {
    return (typeof document == 'string') ? parse(document) : [document];
}

function formatBroadcast(broadcast) {
    const red = Math.min(broadcast.rounds.length * 20, 255);
    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: broadcast.tour.name, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setTitle(broadcast.tour.description)
        .setURL(broadcast.tour.url)
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(formatDescription(broadcast.tour.markup))
        .addField('Rounds', broadcast.rounds.sort((a,b) => a.startsAt - b.startsAt).map(formatRound).join('\n'));
}

function formatDescription(text) {
    text = html2md(text)
    const pattern = /(?<=^|\n)(\|(?:[^\|]+\|)+)\r?\n\|(?:-+\|)+((?:\r?\n\|(?:[^\|]+\|)+)+)/;
    const match = text.match(pattern);
    if (match)
        text = text.replace(match[0], formatTable(match[1], match[2].trim()))
    return text;
}

function formatRound(round) {
    return `<t:${round.startsAt / 1000}> – ${round.name} *<t:${round.startsAt / 1000}:R>*`;
}

function process(bot, msg) {
    broadcast(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    broadcast(interaction.user, interaction);
}

module.exports = {process, interact};
