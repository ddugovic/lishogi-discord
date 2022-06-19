const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const plural = require('plural');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        if (!user || !user.wooglesName) {
            return 'You need to set your woogles username with setuser!';
        }
        username = user.wooglesName;
    }
    const url = 'https://woogles.io/twirp/user_service.ProfileService/GetProfile';
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, {'username': username.toLowerCase()}, {headers: context})
        .then(response => formatProfile(response.data, username))
        .catch(error => {
            console.log(`Error in profile(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(data, username) {
    var embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF)
        .setTitle(formatName(data, username))
        .setURL(`https://woogles.io/profile/${username}`)
        .setThumbnail(data.avatar_url)
        .setDescription(data.about);
    if (data.ratings_json && data.stats_json) {
        let [ratings, records] = parseStats(
            parseData(data.ratings_json),
            parseData(data.stats_json));
        var bingos = 0;
        for (const record of Object.values(records)) {
            bingos += record[3];
        }
        embed = embed
            .setTitle(`${formatName(data, username)} :gem:${bingos}`)
            .addFields(formatStats(ratings, records));
    }
    return { embeds: [ embed ] };
}

function parseData(json) {
    return JSON.parse(json).Data;
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

function parseStats(ratings, stats) {
    const modes = modesArray(ratings);
    var ratings = {};
    var records = {};
    for (var i = 0; i < modes.length; i++) {
        // puzzles are classic and untimed
        const category = modes[i][0].split('.');
        const game = formatTitle(category[1] == 'puzzle' ? 'classic' : category[1]);
        const speed = formatTitle(category[1] == 'puzzle' ? 'puzzle' : category[2]).replace('Ultrablitz','Ultra');
        const lexicon = `${formatLexicon(category[0])} ${game}`;
        const rating = modes[i][1];
        var perf = `${speed}: **${rating.r.toFixed(0)}** ± **${(2 * rating.rd).toFixed(0)}**`;
        var record = stats[modes[i][0]];
        if (record) {
            var wins = record.d1.Wins.t;
            var losses = record.d1.Losses.t;
            var draws = record.d1.Draws.t;
            var bingos = record.d1.Bingos.t;
            // Discord embeds lack a two-column display (classic / wordsmog)
            //perf = `${speed}: **${rating.r.toFixed(0)}** ${formatRecord(wins, losses, draws, bingos)}`;
            if ((record = records[lexicon])) {
                wins += record[0];
                losses += record[1];
                draws += record[2];
                bingos += record[3];
            }
            records[lexicon] = [wins, losses, draws, bingos];
        }
        if (ratings[lexicon]) {
            ratings[lexicon].push(perf);
        } else {
            ratings[lexicon] = [perf];
        }
    }
    return [ratings, records];
}

function formatStats(ratings, records) {
    var fields = [];
    for (const [lexicon, rating] of Object.entries(ratings)) {
        var category = lexicon;
        const record = records[lexicon];
        if (record) {
            const [wins, losses, draws, bingos] = record;
            category = `${lexicon} ${formatRecord(wins, losses, draws, bingos)}`;
        }
        fields.push({ name: category, value: rating.join('\n'), inline: true });
    }
    return fields;
}

// For sorting through modes... woogles api does not put these in an array so we do it ourselves
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

function formatRecord(wins, losses, draws, bingos) {
    var result = [`+${wins}`, `-${losses}`];
    if (draws) {
        result.push(`=${draws}`);
    }
    if (bingos) {
        result.push(`:gem:${bingos}`);
    }
    return `(${result.join(' ')})`
}

function formatLexicon(lexicon) {
    return (
        lexicon.startsWith('CSW') ? 'CSW' :
        lexicon.startsWith('ECWL') ? 'CEL' :
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
