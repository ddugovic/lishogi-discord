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
        embed = embed.addFields(formatRatings(ratings));
        //.addField('Games ', data.count.rated + ' rated, ' + (data.count.all - data.count.rated) + ' casual', true)
    }
    if (data.about) {
        embed = embed.addField('About', data.about);
    }
    return embed;
}

function formatRatings(ratings) {
    const modes = modesArray(ratings);
    var ratings = {};
    for (var i = 0; i < modes.length; i++) {
        // puzzles are classic and untimed
        const category = modes[i][0].split('.');
        const game = formatTitle(category[1] == 'puzzle' ? 'classic' : category[1]);
        const speed = formatTitle(category[1] == 'puzzle' ? 'puzzle' : category[2]);
        const lexicon = `${formatLexicon(category[0])} ${game}`;
        const rating = modes[i][1];
        if (ratings[lexicon]) {
            ratings[lexicon].push(`${speed}: ${rating.r.toFixed(0)} ± ${(2 * rating.rd).toFixed(0)}`);
        } else {
            ratings[lexicon] = [`${speed}: ${rating.r.toFixed(0)} ± ${(2 * rating.rd).toFixed(0)}`];
        }
    }
    var fields = [];
    for (const [category, rating] of Object.entries(ratings)) {
        fields.push({name: category, value: rating.join('\n'), inline: true});
    }
    return fields;
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

function formatLexicon(lexicon) {
    return (
        lexicon.startsWith('CSW') ? 'CSW' :
        lexicon.startsWith('NWL') ? 'NWL' :
        lexicon);
}

function formatTitle(str) {
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
