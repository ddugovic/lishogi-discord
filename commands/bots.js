const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
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
        const url = 'https://lishogi.org/api/users';
        const ids = data.map(bot => bot.id);
        return axios.post(url, ids.join(','), { headers: { Accept: 'application/json' } })
            .then(response => {
                const embed = new Discord.MessageEmbed()
                    .setColor(0xFFFFFF)
                    .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
                    .setTitle(`:robot: Lishogi Bots`)
                    .setURL('https://lishogi.org/player/bots')
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
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://lishogi.org/@/${username})`];
    if (links) {
        for (link of getGitHub(links))
            result.push(`[GitHub](https://${link})`);
        for (link of getGitLab(links))
            result.push(`[GitLab](https://${link})`);
    }
    if (profile && profile.bio) {
        const social = /:\/|:$|github\.com|gitlab\.com|twitch\.tv|youtube\.com/i;
        var bio = profile.bio.split(/\s+/);
        for (let i = 0; i < bio.length; i++) {
            if (bio[i].match(social)) {
                bio = bio.slice(0, i);
                break;
            }
        }
        if (bio.length)
            result.push(bio.join(' '));
    }
    return result.join('\n');
}

function getGitHub(links) {
    const pattern = /github.com\/[\w-]{4,39}\/[\w-]+/g;
    return links.matchAll(pattern);
}

function getGitLab(links) {
    const pattern = /gitlab.com\/[\w-]{8,255}\/[\w-]+/g;
    return links.matchAll(pattern);
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return bots(interaction.user);
}

module.exports = {process, reply};
