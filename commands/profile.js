const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const plural = require('plural');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user) {
            return 'You need to set your woogles.io username with setuser!';
        }
        username = user.chessName;
    }
    const favoriteMode = user.favoriteMode;
    const url = 'https://woogles.io/twirp/user_service.ProfileService/GetProfile';
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, {'username': username.toLowerCase()}, {headers: context})
        .then(response => formatProfile(response.data, username, favoriteMode))
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${favoriteMode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(data, username, favoriteMode) {
    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setAuthor({ name: formatName(data, username), iconURL: data.avatar_url })
        .setThumbnail(data.avatar_url);
    return { embeds: [ setFields(embed, data, favoriteMode) ] };
}

function getFlagEmoji(code) {
    if (countryFlags.countryCode(code))
        return countryFlags.countryCode(code).emoji;
}

function formatName(data, username) {
    var name = data.full_name || username;
    if (data.country_code) {
        const flag = getFlagEmoji(data.country_code);
        if (flag)
            name = `${flag} ${name}`;
    }
    if (data.title)
        name = `${data.title} ${name}`;
    if (data.location)
        name += ` (${data.location})`;
    return name;
}

function setFields(embed, data, favoriteMode) {
    //console.log(data.stats_json);
    if (data.ratings_json) {
        const ratings = JSON.parse(data.ratings_json).Data;
        const mostRecentMode = getMostRecentMode(ratings, favoriteMode);
        embed = embed.addField(mostRecentMode, getMostRecentRating(ratings, mostRecentMode))
        //.addField('Games ', data.count.rated + ' rated, ' + (data.count.all - data.count.rated) + ' casual', true)
    }
    if (data.about) {
        embed = embed.addField('About', data.about);
    }
    return embed;
}

function getMostRecentMode(ratings, favoriteMode) {
    var modes = modesArray(ratings);
    var mostRecentMode = modes[0][0];
    var mostRecentDate = modes[0][1] ? modes[0][1].ts : 0;
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][1] && modes[i][1].ts > mostRecentDate) {
            mostRecentMode = modes[i][0];
            mostRecentDate = modes[i][1].ts;
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
function getMostRecentRating(ratings, mostRecentMode) {
    var modes = modesArray(ratings);
    var mostRecentRating = modes[0][1] ? modes[0][1].r : undefined;
    var mostRecentRD = modes[0][1] ? modes[0][1].rd : undefined;
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].endsWith(`.${mostRecentMode}`) && modes[i][1]) {
            mostRecentRating = modes[i][1].r;
            mostRecentRD = modes[i][1].rd;
        }
    }
    return mostRecentRating ? `${mostRecentRating.toFixed(0)} ± ${(2 * mostRecentRD).toFixed(0)}` : 'None';
}

function formatClubs(clubs) {
    var clubNames = [];
    for (var i = 0; i < clubs.length; i++) {
        clubNames[i] = clubs[i].name;
    }
    return { name: 'Clubs', value: clubNames.sort().join('\n'), inline: false }
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
