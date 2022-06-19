const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const fn = require('friendly-numbers');
const plural = require('plural');
const timeago = require('time-ago')
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user || !user.chessName) {
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

    const firstName = getFirstName(data) || title(data.username);
    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF);
    return setName(embed, data, firstName)
        .then(embed => { return setStats(embed, data, favoriteMode) })
        .then(embed => { return setStreamer(embed, data, firstName) })
        .then(embed => { return setClubs(embed, data) })
        .then(embed => { return { embeds: [ embed ] } });
}

function getFirstName(data) {
    return data.name ? data.name.split(' ')[0] : undefined;
}

function setName(embed, data, firstName) {
    return axios.get(data.country, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            return embed
                .setAuthor({ name: formatName(data, response), iconURL: data.avatar, url: data.url })
                .setThumbnail(data.avatar)
                .setTitle(`Challenge ${formatNickname(firstName, response)} to a game!`)
                .setURL(`https://chess.com/play/${data.username}`);

    });
}

function formatName(data, response) {
    var name = data.name || data.username;
    if (data.title)
        name = `${data.title} ${name}`;
    if (data.location)
        name += ` (${data.location})`;
    else if (response && response.data)
        name += ` (${response.data.name})`;
    return name;
}

function formatNickname(firstName, response) {
    if (response && response.data) {
        const flag = getFlagEmoji(response.data.code);
        if (flag)
            return `${flag} ${firstName}`;
    }
    return firstName;
}

function getFlagEmoji(code) {
    if (countryFlags.countryCode(code))
        return countryFlags.countryCode(code).emoji;
}

function setStats(embed, data, favoriteMode) {
    const url = `https://api.chess.com/pub/player/${data.username}/stats`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            return embed.addFields(formatStats(embed, data, response, favoriteMode));
        });
}

function formatStats(embed, data, response, favoriteMode) {
    const [mode, rating] = getMostRecentMode(response.data, favoriteMode);
    const category = title(mode.replace('chess_',''));
    return [
        { name: 'Followers', value: `**${fn.format(data.followers)}**`, inline: true },
        { name: category, value: rating.last ? formatRating(mode, rating.last, rating.record) : 'None', inline: true },
        { name: 'Last Login', value: timeago.ago(data.last_online * 1000), inline: true }
   ];
}

function setClubs(embed, data) {
    const url = `https://api.chess.com/pub/player/${data.username}/clubs`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            const clubs = response.data.clubs;
            return clubs.length ? embed.addFields(formatClubs(clubs)) : embed;
        });
}

function setStreamer(embed, data, firstName) {
    if (data.is_streamer) {
        embed = embed
            .setTitle(`Watch ${firstName} on Twitch!`)
            .setURL(data.twitch_url);
    }
    return embed
}

function getMostRecentMode(stats, favoriteMode) {
    var modes = modesArray(stats);
    var mostRecentMode = modes[0][0];
    var mostRecentRating = modes[0][1];
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][1].last && modes[i][1].last.date > mostRecentRating.last.date) {
            mostRecentMode = modes[i][0];
            mostRecentRating = modes[i][1];
        }
    }
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostRecentMode = modes[i][0];
            mostRecentRating = modes[i][1];
        }
    }
    return [mostRecentMode, mostRecentRating];
}

function formatRating(mode, last, record) {
    const games = record.win + record.loss + record.draw;
    const puzzleModes = ['lessons', 'puzzle_rush', 'tactics'];
    return `**${last.rating}** ± **${(2 * last.rd)}** over **${fn.format(games)}** ${plural((puzzleModes.includes(mode) ? 'attempt' : ' game'), games)}`;
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
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
