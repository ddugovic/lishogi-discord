const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatUserLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function leaderboard(author, mode) {
    if (!mode)
        mode = await getMode(author) || 'blitz';
    const url = `https://lishogi.org/player/top/10/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
        .then(response => setPlayers(response.data.users, mode))
        .catch((error) => {
            console.log(`Error in leaderboard(${author.username}, ${mode}): \
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

function setPlayers(users, mode) {
    if (users.length) {
        const url = 'https://lishogi.org/api/users';
        const ids = users.map(player => player.id);
        return axios.post(url, ids.join(','), { headers: { Accept: 'application/json' } })
            .then(response => {
                const embed = new Discord.MessageEmbed()
                    .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
                    .setTitle(`:trophy: ${title(mode)} Leaderboard`)
                    .setURL('https://lishogi.org/player')
                    .addFields(response.data.map(formatPlayer).sort((a,b) => b.perfs[mode].rating - a.perfs[mode].rating));
                return { embeds: [ embed ] };
        });
    } else {
        return 'Leader not found!';
    }
}

function formatPlayer(player) {
    const name = formatName(player);
    const badges = player.patron ? '⛩️' : '';
    const profile = formatProfile(player.username, player.profile, player.playTime);
    return { name : `${name} ${badges}`, value: profile, inline: true, perfs: player.perfs};
}

function formatName(player) {
    var name = getLastName(player.profile) ?? player.username;
    if (player.title)
        name = `**${player.title}** ${name}`;
    const [country, rating] = getCountryAndRating(player.profile) || [];
    if (country && countryFlags.countryCode(country))
        name = `${countryFlags.countryCode(country).emoji} ${name}`;
    if (rating)
        name += ` (${rating})`;
    return name;
}

function getLastName(profile) {
    if (profile)
        return profile.lastName;
}

function getCountryAndRating(profile) {
    if (profile)
        return [profile.country, profile.fideRating];
}

function formatProfile(username, profile, fideRating, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lishogi.org/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/)).join(' ');
        if (bio)
            result.push(bio);
    }
    return result.join('\n');
}

function formatBio(bio) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        bio[i] = formatUserLinks(bio[i]);
    }
    return bio;
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
