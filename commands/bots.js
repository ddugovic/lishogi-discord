const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatTitledUserLink, formatUserLink, formatUserLinks } = require('../lib/format-user-links');
const formatSeconds = require('../lib/format-seconds');
const parse = require('ndjson-parse');

async function bots(author) {
    return axios.get('https://lishogi.org/api/bot/online?nb=15', { headers: { Accept: 'application/x-ndjson' } })
        .then(response => setBots(filter(parse(response.data))))
        .catch((error) => {
            console.log(`Error in bots(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function filter(bots) {
    return bots.filter(bot => !bot.tosViolation);
}

function setBots(data) {
    if (data.length) {
        const embed = new Discord.MessageEmbed()
            .setColor(0xFFFFFF)
            .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
            .setTitle(`:robot: Lishogi Bots`)
            .setURL('https://lishogi.org/player/bots')
            .addFields(data.map(formatBot))
        return { embeds: [ embed ] };
    } else {
        return 'No bots are currently online.';
    }
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
    links.unshift(`[Profile](https://lishogi.org/@/${username})`);

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
    return bio.join(' ');
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return bots(interaction.user);
}

module.exports = {process, reply};
