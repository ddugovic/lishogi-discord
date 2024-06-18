const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatMarkup } = require('../lib/format-html');
const formatPages = require('../lib/format-pages');

function broadcast(author, interaction) {
    const url = 'https://lichess.org/api/broadcast/top';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => (json.active ?? json.upcoming ?? json.past).map(formatBroadcast))
        .then(embeds => formatPages(embeds, interaction, 'No broadcast found!'))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatBroadcast(broadcast) {
    const red = Math.floor(255 / (broadcast.tour.tier + 1));
    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: broadcast.tour.name, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setTitle(broadcast.tour.description)
        .setURL(broadcast.tour.url)
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(formatMarkup(broadcast.tour.markup))
        .addFields({ name: 'Next or Last Round', value: formatRound(broadcast.lastRound) });
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
