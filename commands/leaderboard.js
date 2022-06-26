const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
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
    const links = profile ? (profile.links ?? profile.bio) : '';
    const tv = playTime ? playTime.tv : 0;
    const duration = formatSeconds(tv).split(', ')[0];
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://lichess.org/@/${username})`];
    if (links) {
        for (link of getMaiaChess(links))
            result.push(`[Maia Chess](https://${link})`);
        for (link of getTwitch(links))
            result.push(`[Twitch](https://${link})`);
        for (link of getYouTube(links))
            result.push(`[YouTube](https://${link})`);
    }
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if (bio.length) {
            rating = fideRating ?? 1000;
            result.push(bio);
        }
    }
    return [result.join('\n'), rating];
}

function getMaiaChess(links) {
    const pattern = /maiachess.com/g;
    return links.matchAll(pattern);
}

function getTwitch(links) {
    const pattern = /twitch.tv\/\w{4,25}/g;
    return links.matchAll(pattern);
}

function getYouTube(links) {
    // https://stackoverflow.com/a/65726047
    const pattern = /youtube\.com\/(?:channel\/UC[\w-]{21}[AQgw]|(?:c\/|user\/)?[\w-]+)/g
    return links.matchAll(pattern);
}

function formatBio(bio) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
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
