const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatPages } = require('../lib/format-pages');
const { formatSiteLinks, formatThumbnailURL } = require('../lib/format-site-links');

function simul(author, mode, interaction) {
    const url = 'https://lichess.org/api/simul';
    const message = mode ? `No ${mode} event found!` : `No event found!`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatSimuls(json, mode))
        .then(embeds => formatPages(embeds, interaction, message))
        .catch(error => {
            console.log(`Error in simul(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatSimuls(data, mode) {
    var simuls = [];
    for (const status in data)
        simuls.push(...data[status]);
    if (mode)
        simuls = simuls.filter(simul => hasVariant(simul.variants, mode));
    return simuls.sort((a,b) => rankSimul(b) - rankSimul(a)).map(formatSimul);
}

function hasVariant(variants, mode) {
    return variants.map(variant => variant.key).includes(mode);
}

function rankSimul(simul) {
    return simul.isFinished ? simul.nbPairings : (simul.nbApplicants + simul.nbPairings) * 10;
}

function formatSimul(simul) {
    const timestamp = simul.finishedAt ?? simul.startedAt ?? simul.estimatedStartAt;
    const date = new Date(timestamp).toLocaleString('default', { month: 'long', day: 'numeric' });
    const players = simul.nbPairings == 1 ? '**1** player' : `**${simul.nbPairings}** players`;
    const play = simul.isFinished ? 'competed in' :
        simul.isRunning ? `${(simul.nbPairings == 1 ? 'competes' : 'compete')} in` : 'await';
    var embed = new EmbedBuilder()
        .setColor(getColor(simul.host.rating))
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${simul.host.name}`})
        .setThumbnail(getImage(simul.host) ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${date} ${simul.fullName}`)
        .setURL(`https://lichess.org/simul/${simul.id}`)
        .setDescription(`${players} ${play} the ${simul.fullName} <t:${Math.round(timestamp / 1000)}:R>.`);
    if (simul.text) {
        const description = formatDescription(simul.text);
        if (description)
            embed = embed.addFields({ name: 'About', value: description.substring(0, 1000) });
    }
    return embed;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatHost(player) {
    const badges = player.patron ? '🦄' : '';
    return player.title ? `${player.title} ${player.name} ${badges}` : `${player.name} ${badges}`;
}

function getImage(host) {
    if (host.gameId)
        return formatThumbnailURL(host.gameId);
}

function formatDescription(text) {
    const links = formatSocialLinks(text);
    const result = links.length ? [links.join(' | ')] : [];
    const about = formatAbout(text.split(/(?:\r?\n)+/)).join('\n').trim();
    if (about)
        result.push(about);
    return result.join('\n');
}

function formatAbout(about) {
    const social = /(?::\/\/|www\.)|\bdiscord\.gg\b|\bgithub\.com\b|\binstagram\.com\b|\btwitch\.tv\b|\btwitter\.com\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < about.length; i++) {
        if (about[i].match(social)) {
            about.splice(i, 1);
            i -= 1;
            continue;
        }
        about[i] = formatLink(formatSiteLinks(about[i]));
    }
    return about;
}

function process(bot, msg, favoriteMode) {
    simul(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return simul(interaction.user, interaction.options.getString('variant'), interaction);
}

module.exports = {process, interact};
