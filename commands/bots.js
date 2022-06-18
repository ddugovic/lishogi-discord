const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const formatSeconds = require('../lib/format-seconds');
const parse = require('ndjson-parse');

async function bots(author) {
    return axios.get('https://lichess.org/api/bot/online?nb=50', { headers: { Accept: 'application/x-ndjson' } })
        .then(response => setBots(filter(parse(response.data))))
        .catch((error) => {
            console.log(`Error in bots(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function filter(bots) {
    return bots.filter(bot => !bot.tosViolation && source(bot)).sort((a, b) => a.seenAt - b.seenAt).slice(0, 15);
}

function source(bot) {
    const git = /\bgit(?:hub|lab)?\b/;
    if (bot.profile && bot.profile.links)
        return bot.profile.links.match(git);
}

function setBots(data) {
    if (data.length) {
        const url = 'https://lichess.org/api/users';
        const ids = data.map(bot => bot.id);
        return axios.post(url, ids.join(','), { headers: { Accept: 'application/json' } })
            .then(response => {
                const embed = new Discord.MessageEmbed()
                    .setColor(0xFFFFFF)
                    .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
                    .setTitle(`:robot: Lichess Bots`)
                    .setURL('https://lichess.org/player/bots')
                    .addFields(response.data.map(formatBot))
                return { embeds: [ embed ] };
        });
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
    const links = profile ? (profile.links ?? profile.bio) : '';
    const duration = formatSeconds.formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://lichess.org/@/${username})`];
    if (links) {
        for (link of getGitHub(links))
            result.push(`[GitHub](https://${link})`);
        for (link of getGitLab(links))
            result.push(`[GitLab](https://${link})`);
    }
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if (bio)
            result.push(bio);
    }
    return result.join('\n');
}

function formatBio(bio) {
    const social = /:\/\/|\bgithub\.com\b|\bgitlab\.com\b|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    const username = /@(\w+)/g;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        for (match of bio[i].matchAll(username)) {
            bio[i] = bio[i].replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);
        }
    }
    return bio.join(' ');
}

function getGitHub(links) {
    const pattern = /github\.com\/[\w-]{4,39}(?:\/[\w-]+)?/g;
    return links.matchAll(pattern);
}

function getGitLab(links) {
    const pattern = /gitlab\.com\/[\w-]{8,255}(?:\/[\w-]+)?/g;
    return links.matchAll(pattern);
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return bots(interaction.user);
}

module.exports = {process, reply};
