const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const plural = require('plural');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user || !user.playstrategyName) {
            return 'You need to set your playstrategy username with setuser!';
        }
        username = user.playstrategyName;
    }
    var favoriteMode = user.favoriteMode;
    url = `https://playstrategy.org/api/user/${username}`;
    return axios.get(url, { headers: { Accept: 'application/vnd.playstrategy.v3+json' } })
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
    if (data.disabled)
        return 'This account is closed.';

    const [firstName, lastName] = [getFirstName(data), getLastName(data)];
    const country = getCountry(data);
    var nickname = firstName ?? lastName ?? data.username;
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
        status += data.playing.includes('white') ? '  ⚪ Playing' : '  ⚫ Playing';
    else if (!status)
        status = (data.online ? '📶 Online' : '🔴 Offline');
    var badges = data.patron ? '🍺' : '';

    var embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setAuthor({name: `${status}  ${playerName}  ${badges}`, iconURL: null, url: link})
        .setThumbnail('https://assets.playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setTitle(`Challenge ${nickname} to a game!`)
        .setURL(`https://playstrategy.org/?user=${data.username}#friend`);
    if (data.count.all)
        embed = embed.addFields(formatStats(data, favoriteMode));

    return { embeds: [ embed ] };
}

function getCountry(data) {
    return data.profile ? data.profile.country : undefined;
}

function getFirstName(data) {
    return data.profile ? data.profile.firstName : undefined;
}

function getLastName(data) {
    return data.profile ? data.profile.lastName : undefined;
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
            games = `**${modes[i][1].games}** ${plural((mode == 'puzzle' ? 'attempt' : 'game'), modes[i][1].games)}`;
        }
    }
    if (prog > 0)
        prog = `  ▲**${prog}**📈`;
    else if (prog < 0)
        prog = `  ▼**${Math.abs(prog)}**📉`;
    else
        prog = '';
    return `**${rating}** ± **${2*rd}${prog}** over ${games}`;
}

function formatStats(data, favoriteMode) {
    const mode = getMostPlayedMode(data.perfs, favoriteMode);
    if (data.count.all)
        return [
            { name: 'Games', value: `**${data.count.rated}** rated, **${(data.count.all - data.count.rated)}** casual`, inline: true },
            { name: `Rating (${title(mode)})`, value: formatPerfs(data.perfs, mode), inline: true },
            { name: 'Time Played', value: formatTime(data.playTime), inline: true }
       ];
    else
        return [
            { name: category, value: formatPerfs(data.perfs, mode), inline: true }
       ];
}

function formatTime(playTime) {
    var result = [];
    for (duration of formatSeconds.formatSeconds(playTime.total).split(', ')) {
        const [number, unit] = duration.split(' ');
        result.push(`**${number}** ${unit}`);
    }
    return result.join(', ');
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

// For sorting through modes... playstrategy api does not put these in an array so we do it ourselves
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
