const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const fn = require('friendly-numbers');
const plural = require('plural');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user || !user.lishogiName) {
            return 'You need to set your lishogi username with setuser!';
        }
        username = user.lishogiName;
    }
    const favoriteMode = user ? user.favoriteMode : 'blitz';
    const url = `https://lishogi.org/api/user/${username}?trophies=true`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
        .then(response => formatProfile(response.data, favoriteMode))
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(user, favoriteMode) {
    if (user.disabled)
        return 'This account is closed.';

    const username = user.username;
    const [country, firstName, lastName] = getCountryAndName(user.profile);
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && countryFlags.countryCode(country))
        nickname = `${countryFlags.countryCode(country).emoji} ${nickname}`;

    var embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setAuthor(formatPlayer(user.title, name, user.patron, user.trophies ?? [], user.url, user.online, user.playing, user.streaming))
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lishogi.org/?user=${username}#friend`);

    const [mode, rating] = getMostPlayedMode(user.perfs, (user.count.rated ? favoriteMode : 'puzzle'));
    if (unranked(mode, rating)) {
        embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating));
        embed = setAbout(embed, username, user.profile, user.playTime);
        return setTeams(embed, username)
            .then(embed => { return { embeds: [ embed ] } });
    }
    return setStats(embed, user.username, user.count, user.playTime, mode, rating)
        .then(embed => { return setAbout(embed, username, user.profile, user.playTime) })
        .then(embed => { return setTeams(embed, username) })
        .then(embed => { return { embeds: [ embed ] } });
}

function formatPlayer(title, name, patron, trophies, url, online, playing, streaming) {
    if (title)
        name = `${title} ${name}`;
    var badges = patron ? '⛩️' : '';
    for (const trophy of trophies) {
        badges +=
            trophy.type == 'developer' ? '🛠️':
            trophy.type == 'moderator' ? '🔱':
            trophy.type == 'verified' ? '✔️':
            trophy.type.startsWith('marathon') ? '🌐' :
            trophy.top == 1 ? '🥇' :
            trophy.top == 10 ? '🥈' :
            trophy.top ? '🥉' : '🏆';
    }

    // A player is a) streaming and playing b) streaming c) playing d) online e) offline
    var status = streaming ? '📡 Streaming' : '';
    if (playing)
        status += playing.includes('white') ? '  ♙ Playing' : '  ♟️ Playing';
    else if (!status)
        status = online ? '📶 Online' : '🔴 Offline';
    return {'name': `${status}  ${name}  ${badges}`, iconURL: null, 'url': playing ?? url};
}

function unranked(mode, rating) {
    // Players whose RD is above this threshold are unranked
    const standard = ['ultrabullet','bullet','blitz','rapid','classical'];
    return true || mode == 'puzzle' || rating.rd > (standard.includes(mode) ? 75 : 65);
}

function getCountryAndName(profile) {
    if (profile)
        return [profile.country, profile.firstName, profile.lastName];
}

function setStats(embed, username, count, playTime, mode, rating) {
    const url = `https://lishogi.org/api/user/${username}/perf/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
        .then(response => {
            return embed.addFields(formatStats(count, playTime, mode, rating, response.data));
        });
}

function setAbout(embed, username, profile, playTime) {
    const links = profile ? (profile.links ?? profile.bio) : '';
    const duration = formatSeconds.formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://lishogi.org/@/${username})`];
    if (links) {
        for (link of getTwitch(links))
            result.push(`[Twitch](https://${link})`);
        for (link of getYouTube(links))
            result.push(`[YouTube](https://${link})`);
    }
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if (bio)
            result.push(bio);
    }
    return embed.addField('About', result.join('\n'), true);
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

function setTeams(embed, username) {
    const url = `https://lishogi.org/api/team/of/${username}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
        .then(response => {
            const teams = formatTeams(response.data);
            return teams ? embed.addField('Teams', teams, true) : embed;
        });
}

function formatTeams(teams) {
    return teams.slice(0, 10).map(team => `[${team.name}](https://lishogi.org/team/${team.id})`).join('\n');
}

function getMostPlayedMode(perfs, favoriteMode) {
    var modes = modesArray(perfs);
    var mostPlayedMode = modes[0][0];
    var mostPlayedRating = modes[0][1];
    for (var i = 0; i < modes.length; i++) {
        // exclude puzzle games, unless it is the only mode played by that user.
        if (modes[i][0] != 'puzzle' && modes[i][1].games > mostPlayedRating.games) {
            mostPlayedMode = modes[i][0];
            mostPlayedRating = modes[i][1];
        }
    }
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostPlayedMode = modes[i][0];
            mostPlayedRating = modes[i][1];
        }
    }
    return [mostPlayedMode, mostPlayedRating];
}

function formatProgress(progress) {
    return (progress > 0) ? ` ▲**${progress}**📈` : (progress < 0) ? ` ▼**${Math.abs(progress)}**📉` : '';
}

function formatRating(mode, r) {
    const games = `**${fn.format(r.games)}** ${plural((mode == 'puzzle' ? 'attempt' : 'game'), r.games)}`;
    return `**${r.rating}** ± **${2 * r.rd}** over ${games}`;
}

function formatStats(count, playTime, mode, rating, perf) {
    var category = title(mode);
    if (perf)
        category += perf.rank ? ` #${perf.rank}` : ` (Top ${perf.percentile}%)`;
    category += formatProgress(rating.prog);
    if (count.all)
        return [
            { name: 'Games', value: `**${fn.format(count.rated)}** rated, **${fn.format(count.all - count.rated)}** casual`, inline: true },
            { name: category, value: formatRating(mode, rating), inline: true },
            { name: 'Time Played', value: formatSeconds.formatSeconds(playTime ? playTime.total : 0), inline: true }
       ];
    else
        return [
            { name: category, value: formatRating(stats.perfs, mode), inline: true }
       ];
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
            bio[i] = bio[i].replace(match[0], `[${match[0]}](https://lishogi.org/@/${match[1]})`);
        }
    }
    return bio.join(' ');
}

// For sorting through modes... lishogi api does not put these in an array so we do it ourselves
function modesArray(list) {
    var array = [];
    // Count up number of keys...
    var count = 0;
    for (var key in list)
        if (list.hasOwnProperty(key))
            count++;
    // Set up the array.
    for (var i = 0; i < count; i++) {
        array[i] = Object.entries(list)[i];
    }
    return array;
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, username) {
    profile(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return profile(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
