const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatSiteLinks } = require('../lib/format-site-links');
const formatPages = require('../lib/format-pages');
const formatSeconds = require('../lib/format-seconds');
const parse = require('ndjson-parse');
const User = require('../models/User');

async function bots(author, interaction) {
    const mode = await getMode(author) || 'blitz';
    return axios.get('https://lichess.org/api/bot/online?nb=50', { headers: { Accept: 'application/x-ndjson' } })
        .then(response => setBots(filter(parse(response.data)), mode, interaction))
        .catch(error => {
            console.log(`Error in bots(${author.username}): \
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

function filter(bots) {
    return bots.filter(bot => !bot.tosViolation && source(bot)).sort((a, b) => a.seenAt - b.seenAt);
}

function source(bot) {
    const git = /\bgit(?:hub|lab)?\b/;
    if (bot.profile && bot.profile.links)
        return bot.profile.links.match(git);
}

function setBots(bots, mode, interaction) {
    const embeds = bots.map(bot => formatBot(bot, mode));
    if (interaction)
        return embeds.length ? formatPages(embeds, interaction) : interaction.editReply('No bots are currently online.');
    return bots.length ? { embeds: embeds.slice(0, 3) } : 'No bots are currently online.';
}

function formatBot(bot, mode) {
    const username = bot.username;
    const [country, firstName, lastName] = getCountryAndName(bot.profile) ?? [];
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && countryFlags.countryCode(country))
        nickname = `${countryFlags.countryCode(country).emoji} ${nickname}`;

    const badges = bot.patron ? '🦄' : '';
    return new Discord.MessageEmbed()
        .setColor(getColor(getRating(bot.perfs, mode) ?? 1500))
        .setThumbnail('https://lichess1.org/assets/images/icons/bot.png')
        .setAuthor({name: `${name} ${badges}`, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${username}`})
        .setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lichess.org/?user=${bot.username}#friend`)
        .addField('About', formatProfile(bot.username, bot.profile, bot.playTime));
}

function getRating(perfs, mode) {
    if (perfs && perfs[mode])
        return perfs[mode].rating;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 4), 0), 255);
    return formatColor(red, 0, 255-red);
}

function getCountryAndName(profile) {
    if (profile)
        return [profile.country, profile.firstName, profile.lastName];
}

function formatProfile(username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    if (links.length)
        result.push(links.join(' | '));
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/)).join(' ');
        if (bio)
            result.push(bio);
    }
    return result.join('\n');
}

function formatBio(bio) {
    const social = /:\/\/|\bgithub\.com\b|\bgitlab\.com\b|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        bio[i] = formatSiteLinks(bio[i]);
    }
    return bio;
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return bots(interaction.user, interaction);
}

module.exports = { process, interact };
