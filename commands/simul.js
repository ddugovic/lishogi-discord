const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
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
        simul.isRunning ? (simul.nbPairings == 1 ? 'competes' : 'compete') : 'will compete';
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(simul.host.rating))
        .setAuthor({name: formatHost(simul.host), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(simul.fullName)
        .setURL(`https://lichess.org/simul/${simul.id}`)
        .setDescription(`${players} ${compete} in the ${simul.fullName}.`);
    if (simul.host.gameId)
        embed = embed.setImage(`https://lichess1.org/game/export/gif/${simul.host.gameId}.gif`);
    const description = formatDescription(simul.text);
    if (description) {
        const about = new Discord.MessageEmbed()
            .addField('Description', description);
        return { embeds: [ embed, about ] };
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
    var result = [];
    for (link of getDiscord(text))
        result.push(`[Discord](https://${link})`);
    for (link of getGitHub(text))
        result.push(`[GitHub](https://${link})`);
    for (link of getTwitch(text))
        result.push(`[Twitch](https://${link})`);
    for (link of getTwitter(text))
        result.push(`[Twitter](https://${link})`);
    for (link of getYouTube(text))
        result.push(`[YouTube](https://${link})`);
    const about = formatAbout(text.split(/(?:\r?\n)+/));
    if (about.length)
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
            text[i] = text[i].replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);
    }
    return text;
}

function getDiscord(text) {
    const pattern = /discord.gg\/\w{7,8}/g;
    return text.matchAll(pattern);
}

function getGitHub(text) {
    const pattern = /github.com\/[-\w]{4,39}/g;
    return text.matchAll(pattern);
}

function getTwitch(text) {
    const pattern = /twitch.tv\/\w{4,25}/g;
    return text.matchAll(pattern);
}

function getTwitter(text) {
    const pattern = /twitter.com\/\w{1,15}/g;
    return text.matchAll(pattern);
}

function getYouTube(text) {
    // https://stackoverflow.com/a/65726047
    const pattern = /youtube\.com\/(?:channel\/UC[\w-]{21}[AQgw]|(?:c\/|user\/)?[\w-]+)/g
    return text.matchAll(pattern);
}

function process(bot, msg, favoriteMode) {
    simul(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return simul(interaction.user, interaction.options.getString('variant'));
}

module.exports = {process, reply};
