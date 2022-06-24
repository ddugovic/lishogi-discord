const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const plural = require('plural');

async function simul(author) {
    const url = 'https://lichess.org/api/simul';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setSimul(response.data))
        .catch(error => {
            console.log(`Error in simul(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setSimul(data) {
    const simuls = [];
    for (const status in data)
        simuls.push(...data[status]);

    if (simuls.length)
        return formatSimul(simuls.sort((a,b) => rankSimul(b) - rankSimul(a))[0]);
    return 'No event found!';
}

function rankSimul(simul) {
    return simul.isFinished ? 0 : simul.nbApplicants + simul.nbPairings;
}

function formatSimul(simul) {
    const players = simul.nbPairings == 1 ? '1 player competes' : `${simul.nbPairings} players compete`;
    const compete = simul.isFinished ? 'competed' : plural('compete', simul.nbPairings);
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(simul.host.rating))
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(simul.fullName)
        .setURL(`https://lichess.org/simul/${simul.id}`)
        .setDescription(`${players} in the ${simul.fullName}.`);
    if (simul.host.gameId)
        embed = embed.setImage(`https://lichess1.org/game/export/gif/${simul.host.gameId}.gif`);
    const text = formatText(simul.text.split(/\s+/) ?? []);
    if (text) {
        const data = new Discord.MessageEmbed()
            .addField('Description', text);
        return { embeds: [ embed, data ] };
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

function formatText(text) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    const username = /@(\w+)/g;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(social)) {
            text = text.slice(0, i);
            break;
        }
        for (match of text[i].matchAll(username)) {
            text[i] = text[i].replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);
        }
    }
    return text.join(' ');
}

function process(bot, msg) {
    simul(msg.author).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return simul(interaction.user);
}

module.exports = {process, reply};
