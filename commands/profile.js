const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
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
    var favoriteMode = user.favoriteMode;
    url = `https://lichess.org/api/user/${username}?trophies=true`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => formatProfile(response.data, favoriteMode))
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${username}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(data, favoriteMode) {
    if (data.closed)
        return 'This account is closed.';

    const profile = data.profile;
    var username = data.username;
    if (profile && profile.country && countryFlags.countryCode(profile.country))
        username = `${countryFlags.countryCode(profile.country).emoji} ${username}`;

    var playerName = data.username;
    if (profile && profile.firstName && profile.lastName)
        playerName = `${profile.firstName} ${profile.lastName}`;
    if (data.title)
        playerName = `${data.title} ${playerName}`;

    var colorEmoji;
    if (data.playing) {
        colorEmoji = data.playing.includes('white') ? '⚪' : '⚫';
    }
    var status = (!data.online ? '🔴 Offline' : (colorEmoji ? colorEmoji + ' Playing' : '📶 Online'));
    if (data.streaming)
        status = '📡 Streaming  ' + status;
    var trophies = data.patron ? '🦄' : '';
    for (trophy of data.trophies) {
        trophies +=
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
        .setAuthor({name: `${status}  ${playerName}  ${trophies}`, iconURL: null, url: data.url})
        .setTitle(`:crossed_swords: Challenge ${username} to a game!`)
        .setURL(`https://lichess.org/?user=${data.username}#friend`);
    return setStats(embed, data, favoriteMode)
        .then(embed => { return setTeams(embed, data) })
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in formatProfile(${data}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setStats(embed, data, favoriteMode) {
    const mode = getMostPlayedMode(data.perfs, favoriteMode);
    const url = `https://lichess.org/api/user/${data.username}/perf/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => {
            const perf = response.data;
            return embed.addFields(formatStats(data, mode, perf));
        });
}

function setTeams(embed, data) {
    const url = `https://lichess.org/api/team/of/${data.username}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
        .then(response => {
            const data = response.data;
            return data.length ? embed.addFields(formatTeams(data)) : embed;
        });
}

function getMostPlayedMode(list, favoriteMode) {
    var modes = modesArray(list);
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
function getMostPlayedRating(list, mostPlayedMode) {
    var modes = modesArray(list);
    var mostPlayedRD = modes[0][1].rd;
    var mostPlayedProg = modes[0][1].prog;
    var mostPlayedRating = modes[0][1].rating;
    var mostPlayedGames = modes[0][1].games;
    for (var i = 0; i < modes.length; i++) {
        // exclude puzzle games, unless it is the only mode played by that user.
        if (modes[i][0] == mostPlayedMode) {
            mostPlayedRD = modes[i][1].rd;
            mostPlayedProg = modes[i][1].prog;
            mostPlayedRating = modes[i][1].rating;
            mostPlayedGames = modes[i][1].games + ' ' + plural((mostPlayedMode == 'puzzle' ? 'attempt' : ' game'), modes[i][1].games);
        }
    }
    if (mostPlayedProg > 0)
        mostPlayedProg = ' ▲' + mostPlayedProg + '📈';
    else if (mostPlayedProg < 0)
        mostPlayedProg = ' ▼' + Math.abs(mostPlayedProg) + '📉';
    else
        mostPlayedProg = '';

    var formattedMessage = mostPlayedRating + ' ± ' + (2 * mostPlayedRD) +
        mostPlayedProg + ' over ' + mostPlayedGames;
    return formattedMessage;
}

function formatStats(data, mode, perf) {
    const category = perf && perf.rank ? `Rating (${title(mode)}) #${perf.rank}` : `Rating (${title(mode)})`;
    return [
        { name: 'Games', value: `${data.count.rated} rated, ${(data.count.all - data.count.rated)} casual`, inline: true },
        { name: category, value: getMostPlayedRating(data.perfs, mode), inline: true },
        { name: 'Time Played', value: formatSeconds.formatSeconds(data.playTime.total), inline: true }
   ];
}

function formatTeams(teams) {
    var names = [];
    for (var i = 0; i < teams.length; i++) {
        names[i] = teams[i].name;
    }
    return { name: 'Teams', value: names.sort().join('\n'), inline: false }
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
