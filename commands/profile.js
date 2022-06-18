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
        if (!user || !user.lichessName) {
            return 'You need to set your lichess username with setuser!';
        }
        username = user.lichessName;
    }
    const url = `https://lichess.org/api/user/${username}?trophies=true`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => formatProfile(response.data, user.favoriteMode))
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(data, favoriteMode) {
    if (data.disabled)
        return 'This account is closed.';

    const username = data.username;
    const profile = data.profile;
    const [firstName, lastName] = [getFirstName(profile), getLastName(profile)];
    const country = getCountry(profile);
    var nickname = firstName ?? lastName ?? username;
    var playerName = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && countryFlags.countryCode(country))
        nickname = `${countryFlags.countryCode(country).emoji} ${nickname}`;
    if (data.title)
        playerName = `${data.title} ${playerName}`;

    const link = data.playing ?? data.url;
    var status = '';
    if (data.streaming)
        status = '📡 Streaming';
    if (data.playing)
        status += data.playing.includes('white') ? '  ♙ Playing' : '  ♟️ Playing';
    else if (!status)
        status = (data.online ? '📶 Online' : '🔴 Offline');
    var badges = data.patron ? '🦄' : '';
    for (trophy of data.trophies) {
        badges +=
            trophy.type == 'developer' ? '🛠️':
            trophy.type == 'moderator' ? '🔱':
            trophy.type == 'verified' ? '✔️':
            trophy.type.startsWith('marathon') ? '🌐' :
            trophy.top == 1 ? '🥇' :
            trophy.top == 10 ? '🥈' :
            trophy.top ? '🥉' : '🏆';
    }

    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setAuthor({name: `${status}  ${playerName}  ${badges}`, iconURL: null, url: link})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lichess.org/?user=${username}#friend`);
    return setStats(embed, data, favoriteMode)
        .then(embed => { return setAbout(embed, username, profile, data.playTime) })
        .then(embed => { return setTeams(embed, username) })
        .then(embed => { return { embeds: [ embed ] } });
}

function getCountry(profile) {
    if (profile)
        return profile.country;
}

function getFirstName(profile) {
    if (profile)
        return profile.firstName;
}

function getLastName(profile) {
    if (profile)
        return profile.lastName;
}

function setStats(embed, data, favoriteMode) {
    // TODO Short-circuit evaluation (but return a promise) if mode is 'puzzle'
    const mode = data.count.rated ? getMostPlayedMode(data.perfs, favoriteMode) : 'puzzle';
    const url = `https://lichess.org/api/user/${data.username}/perf/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => {
            if (data.count.all)
                return embed.addFields(formatStats(data, mode, response.data));
            return embed;
        });
}

function setAbout(embed, username, profile, playTime) {
    const links = profile ? (profile.links ?? profile.bio) : '';
    const duration = formatSeconds.formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://lichess.org/@/${username})`];
    if (links) {
        for (link of getMaiaChess(links))
            result.push(`[Maia Chess](https://${link})`);
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

function setTeams(embed, username) {
    const url = `https://lichess.org/api/team/of/${username}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => {
            const teams = formatTeams(response.data);
            return teams ? embed.addField('Teams', teams, true) : embed;
        });
}

function formatTeams(teams) {
    return teams.map(team => `[${team.name}](https://lichess.org/team/${team.id})`).join('\n');
}

function getMostPlayedMode(perfs, favoriteMode) {
    var modes = modesArray(perfs);
    var mostPlayedMode = modes[0][0];
    var mostPlayedGames = modes[0][1].games;
    for (var i = 0; i < modes.length; i++) {
        // exclude puzzle games, unless it is the only mode played by that user.
        if (modes[i][0] != 'puzzle' && modes[i][1].games > mostPlayedGames) {
            mostPlayedMode = modes[i][0];
            mostPlayedGames = modes[i][1].games;
        }
    }
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostPlayedMode = modes[i][0];
            mostPlayedGames = modes[i][1].games;
        }
    }
    return mostPlayedMode;
}
// Get string with highest rating formatted for profile
function formatPerfs(perfs, mode) {
    const modes = modesArray(perfs);
    var rd = modes[0][1].rd;
    var prog = modes[0][1].prog;
    var rating = modes[0][1].rating;
    var games = modes[0][1].games;
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0] == mode) {
            rd = modes[i][1].rd;
            prog = modes[i][1].prog;
            rating = modes[i][1].rating;
            games = `**${fn.format(modes[i][1].games)}** ${plural((mode == 'puzzle' ? 'attempt' : 'game'), modes[i][1].games)}`;
        }
    }
    if (prog > 0)
        prog = `  ▲**${prog}**📈`;
    else if (prog < 0)
        prog = `  ▼**${Math.abs(prog)}**📉`;
    else
        prog = '';
    return `**${rating}** ± **${2*rd}**${prog} over ${games}`;
}

function formatStats(stats, mode, perf) {
    const category = perf && perf.rank ? `Rating (${title(mode)}) #${perf.rank}` : `Rating (${title(mode)})`;
    if (stats.count.all)
        return [
            { name: 'Games', value: `**${fn.format(stats.count.rated)}** rated, **${fn.format(stats.count.all - stats.count.rated)}** casual`, inline: true },
            { name: category, value: formatPerfs(stats.perfs, mode), inline: true },
            { name: 'Time Played', value: formatSeconds.formatSeconds(stats.playTime ? stats.playTime.total : 0), inline: true }
       ];
    else
        return [
            { name: category, value: formatPerfs(stats.perfs, mode), inline: true }
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
            bio[i] = bio[i].replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);
        }
    }
    return bio.join(' ');
}

// For sorting through modes... lichess api does not put these in an array so we do it ourselves
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
