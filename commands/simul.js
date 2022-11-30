const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatSocialLinks } = require('../lib/format-links');
const { formatUserLink, formatUserLinks } = require('../lib/format-site-links');
const User = require('../models/User');

async function simul(author) {
    const url = 'https://lidraughts.org/api/simul';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/vnd.lidraughts.v3+json' } })
	.then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setSimul(json))
        .catch(error => {
            console.log(`Error in simul(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function setSimul(data) {
    for ([key, simuls] of Object.entries(data)) {
        if (simuls.length)
            return formatSimul(simuls[0]);
    }
    return 'No events found!';
}

function rankSimul(simul) {
    return simul.isFinished ? simul.nbPairings : (simul.nbApplicants + simul.nbPairings) * 10;
}

function formatSimul(simul) {
    const players = simul.nbPairings == 1 ? '1 player' : `${simul.nbPairings} players`;
    const compete = simul.isFinished ? 'competed' :
        simul.isRunning ? (simul.nbPairings == 1 ? 'competes' : 'compete') : 'will compete';
    var embed = new EmbedBuilder()
        .setColor(getColor(simul.host.rating))
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lidraughts1.org/assets/logo/lidraughts-favicon-32-invert.png'})
        .setThumbnail('https://lidraughts1.org/assets/logo/lidraughts-favicon-64.png')
        .setTitle(simul.fullName)
        .setURL(`https://lidraughts.org/simul/${simul.id}`)
        .setDescription(`${players} ${compete} in the ${simul.fullName}.`);
    if (simul.host.gameId)
        embed = embed.setImage(`https://lidraughts1.org/game/export/gif/${simul.host.gameId}.gif`);
    if (simul.text) {
        const description = formatDescription(simul.text);
        if (description)
            embed = embed.addFields({ name: 'About', value: description });
    }
    return { embeds: [ embed ] };
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatHost(player) {
    return player.title ? `${player.title} ${player.name}` : player.name;
}

function formatDescription(text) {
    const links = formatSocialLinks(text);
    const result = links.length ? [links.join(' | ')] : [];
    const about = formatAbout(text.split(/(?:\r?\n)+/));
    if (about.length && about.join('').length)
        result.push(about.join('\n'));
    return result.join('\n');
}

function formatAbout(text) {
    const social = /:\/\/|\btwitch\.tv\b|\btwitter\.com\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(social)) {
            text.splice(i, 1);
            i -= 1;
            continue;
        }
        bio[i] = formatUserLinks(bio[i]);
    }
    return text;
}

function process(bot, msg, favoriteMode) {
    simul(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return simul(interaction.user);
}

module.exports = {process, reply};
