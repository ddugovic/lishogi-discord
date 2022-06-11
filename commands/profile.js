const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const plural = require('plural');
const timeago = require('time-ago')
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user) {
            return 'You need to set your chess.com username with setuser!';
        }
        username = user.chessName;
    }
    const favoriteMode = user.favoriteMode;
    const url = `https://api.chess.com/pub/player/${username}`;
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

    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF);
    return setName(embed, data)
        .then(embed => { return setStats(embed, data, favoriteMode) })
        .then(embed => { return setStreamer(embed, data) })
        .then(embed => { return setClubs(embed, data) })
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in formatProfile(${data}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function getFlagEmoji(code) {
    if (countryFlags.countryCode(code))
        return countryFlags.countryCode(code).emoji;
}

function formatName(data, response) {
    var name = data.name || data.username;
    if (data.title)
        name = `${data.title} ${name}`;
    if (response && response.data) {
        const flag = getFlagEmoji(response.data.code);
        if (flag)
            name = `${flag} ${name}`;
    }
    if (data.location)
        name += ` (${data.location})`;
    else if (response && response.data)
        name += ` (${response.data.name})`;
    return name;
}

function setName(embed, data) {
    return axios.get(data.country, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            return embed
                .setAuthor({ name: formatName(data, response), iconURL: data.avatar, url: data.url });
    });
}

function setStats(embed, data, favoriteMode) {
    const url = `https://api.chess.com/pub/player/${data.username}/stats`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            return embed.addFields(formatStats(embed, data, response, favoriteMode));
        });
}

function formatStats(embed, data, response, favoriteMode) {
    const mode = getMostRecentMode(response.data, favoriteMode);
    const rating = getMostRecentRating(response.data, mode);
    return [
        { name: 'Followers', value: `${data.followers}`, inline: true },
        { name: 'Rating (' + mode + ')', value: rating, inline: true },
        { name: 'Last Login', value: timeago.ago(data.last_online * 1000), inline: true }
   ];
}

function setClubs(embed, data) {
    const url = `https://api.chess.com/pub/player/${data.username}/clubs`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            return embed.addFields(formatClubs(response.data.clubs));
        });
}

function setStreamer(embed, data) {
    if (data.is_streamer) {
        embed = embed
            .setTitle('Watch ' + data.username + ' on Twitch!')
            .setURL(data.twitch_url);
    }
    return embed
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

function formatClubs(clubs) {
    var lastActiveClub = clubs[0].name;
    var lastActiveDate = clubs[0].last_activity;
    for (var i = 0; i < clubs.length; i++) {
        if (clubs[i].last_activity > lastActiveDate) {
            lastActiveClub = clubs[i].name;
            lastActiveDate = clubs[i].last_activity;
        }
    }
    return { name: 'Active Club', value: lastActiveClub, inline: false }
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
