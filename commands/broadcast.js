const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const formatPages = require('../lib/format-pages');

function broadcast(author, interaction) {
    const url = 'https://lichess.org/api/broadcast/top';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatBroadcasts(json))
        .then(embeds => formatPages(embeds, interaction, 'No broadcast found!'))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatBroadcasts(json) {
    return (json.active ?? json.upcoming ?? (json.past ? json.past.currentPageResults : [])).map(formatBroadcast)
}

function formatBroadcast(broadcast) {
    const red = Math.floor(255 / (broadcast.tour.tier || 1));
    let embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setTitle(broadcast.tour.name)
        .setURL(broadcast.tour.url)
        .setThumbnail(broadcast.tour.image ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png');
    if (broadcast.tour.description) {
        embed = embed.setDescription(broadcast.tour.description);
    }
    if (broadcast.tour.dates) {
        embed = embed.addFields({ name: 'Schedule', value: broadcast.tour.dates.map(formatRoundDate).join('\n') });
    }
    return embed;
}

function formatRoundDate(date) {
    return `<t:${date / 1000}> – *<t:${date / 1000}:R>*`;
}

function process(bot, msg) {
    broadcast(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    broadcast(interaction.user, interaction);
}

module.exports = {process, interact};
