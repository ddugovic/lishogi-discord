const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatTitledUserLink, formatUserLink, formatUserLinks } = require('../lib/format-user-links');
const formatSeconds = require('../lib/format-seconds');
const parse = require('ndjson-parse');
const User = require('../models/User');

async function bots(author) {
    const mode = await getMode(author) || 'blitz';
    return axios.get('https://lichess.org/api/bot/online?nb=50', { headers: { Accept: 'application/x-ndjson' } })
        .then(response => setBots(filter(parse(response.data)), mode))
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
    return bots.filter(bot => !bot.tosViolation && source(bot)).sort((a, b) => a.seenAt - b.seenAt).slice(0, 15);
}

function source(bot) {
    const git = /\bgit(?:hub|lab)?\b/;
    if (bot.profile && bot.profile.links)
        return bot.profile.links.match(git);
}

function setBots(bots, mode) {
    if (bots.length) {
        const rating = Math.max(...bots.map(bot => getRating(bot.perfs, mode) ?? 1500));
        const embed = new Discord.MessageEmbed()
            .setColor(getColor(rating))
            .setThumbnail('https://lichess1.org/assets/images/icons/bot.png')
            .setTitle(`:robot: Lichess Bots`)
            .setURL('https://lichess.org/player/bots')
            .addFields(bots.map(formatBot))
        return { embeds: [ embed ] };
    } else {
        return 'No bots are currently online.';
    }
}

function getRating(perfs, mode) {
    if (perfs && perfs[mode])
        return perfs[mode].rating;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 4), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatBot(bot) {
    const name = formatName(bot);
    const badges = bot.patron ? '🦄' : '';
    return { name : `${name} ${badges}`, value: formatProfile(bot.username, bot.profile, bot.playTime), inline: true };
}

function formatName(bot) {
    var name = bot.username;
    const country = getCountry(bot.profile);
    if (country && countryFlags.countryCode(country))
        name = `${countryFlags.countryCode(country).emoji} ${name}`;
    return name;
}

function getCountry(profile) {
    if (profile)
        return profile.country;
}

function formatProfile(username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lichess.org/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
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
        bio[i] = formatUserLinks(bio[i]);
    }
    return bio;
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return bots(interaction.user);
}

module.exports = {process, reply};
