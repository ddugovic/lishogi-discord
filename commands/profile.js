const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const plural = require('plural');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user) {
            return 'You need to set your chess.com username with setuser!';
        }
        username = user.chessName;
    }
    var favoriteMode = user.favoriteMode;
    url = `https://api.chess.com/pub/player/${username}`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => formatProfile(response.data, favoriteMode))
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(data, favoriteMode) {
    if (data.status == 'closed' || data.status == 'closed:fair_play_violations')
        return 'This account is closed.';

    var status = data.is_streamer ? '📡 Streamer' : '';

    var playerName = data.username;
    if (data.title)
        playerName = data.title + ' ' + playerName;

    url = `https://api.chess.com/pub/player/${data.username}/stats`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            var mostRecentMode = getMostRecentMode(response.data, favoriteMode);
            var formattedMessage = new Discord.MessageEmbed()
                .setColor(0xFFFFFF)
                .setAuthor({name: playerName + '  ' + status, iconURL: data.avatar, url: data.url})
                //.addField('Games ', data.count.rated + ' rated, ' + (data.count.all - data.count.rated) + ' casual', true)
                .addField('Rating (' + mostRecentMode + ')', getMostRecentRating(response.data, mostRecentMode), true)
                .addField('Offline', formatSeconds.formatSeconds(Date.now() / 1000 - data.last_online), true);
            return { embeds: [formattedMessage] };
        })
        .catch(error => {
            console.log(`Error in formatProfile(${data}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function getMostRecentMode(stats, favoriteMode) {
    var modes = modesArray(stats);
    var mostRecentMode = modes[0][0];
    var mostRecentDate = modes[0][1] && modes[0][1].last ? modes[0][1].last.date : 0;
    for (var i = 0; i < modes.length; i++) {
        // exclude puzzle games, unless it is the only mode played by that user.
        if (modes[i][1].last && modes[i][1].last.date > mostRecentDate) {
            mostRecentMode = modes[i][0];
            mostRecentDate = modes[i][1].last.date;
        }
    }
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostRecentMode = modes[i][0];
        }
    }
    return mostRecentMode;
}
// Get string with highest rating formatted for profile
function getMostRecentRating(stats, mostRecentMode) {
    console.log(stats, mostRecentMode);
    var modes = modesArray(stats);

    var mostRecentRD = modes[0][1].last ? modes[0][1].last.rd : undefined;
    var mostRecentRating = modes[0][1].last ? modes[0][1].last.rating : undefined;
    var mostRecentGames = modes[0][1].record ? modes[0][1].record.win + modes[0][1].record.loss + modes[0][1].record.draw : undefined;
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0] == mostRecentMode && modes[i][1].last) {
            mostRecentRD = modes[i][1].last.rd;
            mostRecentRating = modes[i][1].last.rating;
            mostRecentGames = modes[i][1].record.win + modes[i][1].record.loss + modes[i][1].record.draw;
            mostRecentGames = mostRecentGames + ' ' + plural((mostRecentMode == 'puzzle' ? 'attempt' : ' game'), mostRecentGames);
        }
    }
    return `${mostRecentRating} ± ${(2 * mostRecentRD)} over ${mostRecentGames}`;
}

// For sorting through modes... chess api does not put these in an array so we do it ourselves
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
