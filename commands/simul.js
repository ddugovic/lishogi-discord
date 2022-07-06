const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');
const { formatSiteLinks } = require('../lib/format-site-links');

function simul(author, mode, interaction) {
    const url = 'https://lishogi.org/api/simul';
    const message = mode ? `No ${mode} event found!` : `No event found!`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatSimuls(response.data, mode))
        .then(embeds => formatPages(embeds, interaction, message))
        .catch(error => {
            console.log(`Error in simul(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
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
    const players = simul.nbPairings == 1 ? '1 player' : `${simul.nbPairings} players`;
    const compete = simul.isFinished ? 'competed' :
        simul.isRunning ? (simul.nbPairings == 1 ? 'competes' : 'compete') : 'await';
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(simul.host.rating))
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png'})
        .setThumbnail(getImage(simul.host) ?? 'https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(simul.fullName)
        .setURL(`https://lishogi.org/simul/${simul.id}`)
        .setDescription(`${players} ${compete} in the ${simul.fullName}.`);
    if (simul.text) {
        const description = formatDescription(simul.text);
        if (description)
            embed = embed.addField('Description', description);
    }
    return embed;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatHost(player) {
    const badges = player.patron ? '⛩️' : '';
    return player.title ? `${player.title} ${player.name} ${badges}` : `${player.name} ${badges}`;
}

function getImage(host) {
    if (host.gameId)
        return `https://lishogi1.org/game/export/gif/${host.gameId}.gif`;
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
    const social = /(?::\/\/|www\.)|\btwitch\.tv\b|\btwitter\.com\b|\byoutube\.com\b|\byoutu\.be\b/i;
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
