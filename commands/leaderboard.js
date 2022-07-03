const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatUserLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function leaderboard(author, mode) {
    if (!mode)
        mode = await getMode(author) || 'blitz';
    const url = `https://lichess.org/player/top/10/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => setPlayers(response.data.users, mode))
        .catch(error => {
            console.log(`Error in leaderboard(${author.username} ${mode}): \
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
        const url = 'https://lichess.org/api/users';
        const ids = users.map(player => player.id);
        return axios.post(url, ids.join(','), { headers: { Accept: 'application/json' } })
            .then(response => {
                const fields = response.data.map(formatPlayer);
                const rating = Math.max(...fields.map(field => field.rating));
                const embed = new Discord.MessageEmbed()
                    .setColor(getColor(rating))
                    .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
                    .setTitle(`:trophy: ${title(mode)} Leaderboard`)
                    .setURL('https://lichess.org/player')
                    .addFields(fields.sort((a,b) => b.perfs[mode].rating - a.perfs[mode].rating));
                return { embeds: [ embed ] };
        });
    } else {
        return 'Leader not found!';
    }
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    const fideRating = getRating(player.profile);
    const [profile, rating] = formatProfile(player.username, player.profile, fideRating, player.playTime);
    const name = formatName(player, rating);
    const badges = player.patron ? '🦄' : '';
    return { name : `${name} ${badges}`, value: profile, inline: true, perfs: player.perfs, 'rating': rating };
}

function formatName(player, rating) {
    var name = getLastName(player.profile) ?? player.username;
    if (player.title)
        name = `**${player.title}** ${name}`;
    const country = getCountry(player.profile);
    if (country && countryFlags.countryCode(country))
        name = `${countryFlags.countryCode(country).emoji} ${name}`;
    if (rating > 1000)
        name += ` (${rating})`;
    return name;
}

function getCountry(profile) {
    if (profile)
        return profile.country;
}

function getLastName(profile) {
    if (profile)
        return profile.lastName;
}

function getRating(profile) {
    if (profile)
        return profile.fideRating;
}

function formatProfile(username, profile, fideRating, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lichess.org/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/)).join(' ');
        if (bio) {
            rating = fideRating ?? 1000;
            result.push(bio);
        }
    }
    return [result.join('\n'), rating];
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
