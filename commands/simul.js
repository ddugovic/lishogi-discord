const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatUserLinks } = require('../lib/format-site-links');
const User = require('../models/User');

async function simul(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = 'https://lichess.org/api/simul';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setSimul(response.data, mode))
        .catch(error => {
            console.log(`Error in simul(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.favoriteMode;
}

function setSimul(data, mode) {
    const simuls = [];
    for (const status in data)
        simuls.push(...data[status]);

    if (mode) {
        const matches = simuls.filter(simul => simul.variants.map(variant => variant.key).includes(mode));
        if (matches.length)
            return formatSimul(matches.sort((a,b) => rankSimul(b) - rankSimul(a))[0]);
    }
    if (simuls.length)
        return formatSimul(simuls.sort((a,b) => rankSimul(b) - rankSimul(a))[0]);
    return 'No event found!';
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
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(simul.fullName)
        .setURL(`https://lichess.org/simul/${simul.id}`)
        .setDescription(`${players} ${compete} in the ${simul.fullName}.`);
    if (simul.host.gameId)
        embed = embed.setImage(`https://lichess1.org/game/export/gif/${simul.host.gameId}.gif`);
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
    const links = formatSocialLinks(text);
    const result = links.length ? [links.join(' | ')] : [];
    const about = formatAbout(text.split(/(?:\r?\n)+/)).join('\n').trim();
    if (about)
        result.push(about);
    return result.join('\n');
}

function formatAbout(about) {
    const social = /:\/\/|\btwitch\.tv\b|\btwitter\.com\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < about.length; i++) {
        if (about[i].match(social)) {
            about.splice(i, 1);
            i -= 1;
            continue;
        }
        about[i] = formatUserLinks(about[i]);
    }
    return about;
}

function process(bot, msg, favoriteMode) {
    simul(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return simul(interaction.user, interaction.options.getString('variant'));
}

module.exports = {process, reply};
