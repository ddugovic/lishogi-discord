const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const formatLinks = require('../lib/format-links');
const User = require('../models/User');

async function simul(author) {
    const url = 'https://lishogi.org/api/simul';
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
        .then(response => setSimul(response.data))
        .catch(error => {
            console.log(`Error in simul(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
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
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(simul.host.rating))
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png'})
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(simul.fullName)
        .setURL(`https://lishogi.org/simul/${simul.id}`)
        .setDescription(`${players} ${compete} in the ${simul.fullName}.`);
    if (simul.host.gameId)
        embed = embed.setImage(`https://lishogi1.org/game/export/gif/${simul.host.gameId}.gif`);
    if (simul.text) {
        const description = formatDescription(simul.text);
        if (description) {
            const about = new Discord.MessageEmbed()
                .addField('Description', description);
            return { embeds: [ embed, about ] };
        }
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
    const links = formatLinks(text);
    const result = links.length ? [links.join(' | ')] : [];
    const about = formatAbout(text.split(/(?:\r?\n)+/));
    if (about.length && about.join('').length)
        result.push(about.join('\n'));
    return result.join('\n');
}

function formatAbout(text) {
    const social = /:\/\/|\btwitch\.tv\b|\btwitter\.com\b|\byoutube\.com\b|\byoutu\.be\b/i;
    const username = /@(\w+)/g;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(social)) {
            text.splice(i, 1);
            i -= 1;
            continue;
        }
        for (match of text[i].matchAll(username))
            text[i] = text[i].replace(match[0], `[${match[0]}](https://lishogi.org/@/${match[1]})`);
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
