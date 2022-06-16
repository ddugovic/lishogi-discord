const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
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
    var favoriteMode = user.favoriteMode;
    url = `https://lishogi.org/api/user/${username}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
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

    const link = data.playing ?? data.url;
    var status = '';
    if (data.streaming)
        status = '📡 Streaming';
    if (data.playing)
        status += data.playing.includes('sente') ? '  ☗ Playing' : '  ☖ Playing';
    else if (!status)
        status = (data.online ? '📶 Online' : '🔴 Offline');
    var badges = data.patron ? '☗' : '';

    var mostPlayedMode = getMostPlayedMode(data.perfs, favoriteMode);
    var formattedMessage = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setAuthor({name: `${status}  ${playerName}  ${badges}`, iconURL: null, url: link})
        .setTitle(`Challenge ${username} to a game!`)
        .setURL(`https://lishogi.org/?user=${data.username}#friend`)
        .addField('Games ', data.count.rated + ' rated, ' + (data.count.all - data.count.rated) + ' casual', true)
        .addField('Rating (' + mostPlayedMode + ')', getMostPlayedRating(data.perfs, mostPlayedMode), true)
        .addField('Time Played', formatSeconds.formatSeconds(data.playTime.total), true);

    return { embeds: [formattedMessage] };
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

function process(bot, msg, username) {
    profile(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return profile(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
