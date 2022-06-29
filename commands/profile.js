const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');
const fn = require('friendly-numbers');
const plural = require('plural');
const QuickChart = require('quickchart-js');
const formatLinks = require('../lib/format-links');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your chess.com username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    const url = `https://api.chess.com/pub/player/${username}`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => formatProfile(response.data, favoriteMode))
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.chessName;
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(user, favoriteMode) {
    if (user.status == 'closed' || user.status == 'closed:fair_play_violations')
        return 'This account is closed.';

    const firstName = getFirstName(user) || title(user.username);
    /*const color = streaming ? (playing ? 0xFF00FF : 0x7F007F) :
        playing ? 0x00FF00 :
        online ? 0x007F00 : 0x000000;*/
    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF);
    return setName(embed, user, firstName)
        .then(embed => setStats(embed, user, favoriteMode))
        .then(embed => { return user.is_streamer ? setStreamer(embed, user.twitch_url, firstName) : embed })
        .then(embed => setClubs(embed, user.username))
        .then(embed => setGames(embed, user.username))
        .then(embed => { return { embeds: [ embed ] } });
}

function getFirstName(user) {
    return user.name ? user.name.split(' ')[0] : undefined;
}

function setName(embed, user, firstName) {
    return axios.get(user.country, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            return embed
                .setAuthor({ name: formatName(user, response), iconURL: user.avatar, url: user.url })
                .setThumbnail(user.avatar)
                .setTitle(`Challenge ${formatNickname(firstName, response)} to a game!`)
                .setURL(`https://chess.com/play/${user.username}`);

    });
}

function formatName(user, response) {
    var name = user.name || user.username;
    if (user.title)
        name = `${user.title} ${name}`;
    if (user.location)
        name += ` (${user.location})`;
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

function setStats(embed, user, favoriteMode) {
    const url = `https://api.chess.com/pub/player/${user.username}/stats`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            const [games, mode, rating] = getMostRecentMode(response.data, favoriteMode);
            embed = embed.addFields(formatStats(embed, user.last_online, games, mode, rating));
            return games ? setHistory(embed, user.username) : embed;
        });
}

function formatStats(embed, lastOnline, games, mode, rating) {
    const category = title(mode.replace('chess_',''));
    if (games)
        return [
            { name: 'Games', value: `**${fn.format(games)}**`, inline: true },
            { name: category, value: formatRating(mode, rating.last, rating.record) ?? 'None', inline: true },
            { name: 'Last Login', value: `<t:${lastOnline}:R>`, inline: true }
       ];
    else
        return [
            { name: category, value: formatRating(mode, rating.last, rating.record) ?? 'None', inline: true },
            { name: 'Last Login', value: `<t:${lastOnline}:R>`, inline: true }
       ];
}

function setStreamer(embed, twitchUrl, firstName) {
    const url = 'https://api.chess.com/pub/streamers';
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            const streamer = response.data.streamers.filter(streamer => streamer.twitch_url == twitchUrl)[0];
            return embed.setThumbnail(streamer.avatar)
                .setTitle(streamer.is_live ? `📡 Watch ${firstName} live on Twitch!` : `📡 Follow ${firstName} on Twitch!`)
                .setURL(twitchUrl);
        });
}

function setClubs(embed, username) {
    const url = `https://api.chess.com/pub/player/${username}/clubs`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            const clubs = response.data.clubs;
            return clubs.length ? embed.addField('Clubs', clubs.map(club => club.name).join('\n'), true) : embed;
        });
}

function setGames(embed, username) {
    const url = `https://api.chess.com/pub/player/${username}/games`;
    return axios.get(url, { headers: { Accept: 'application/nd-json' } })
        .then(response => {
            const games = response.data.games;
            return games.length ? embed.addField('Rating', games.slice(0, 5).map(formatGame).join('\n'), true) : embed;
        });
}

function formatGame(game) {
    const due = game.move_by ? `due <t:${game.move_by}:R>` : `last move <t:${game.last_activity}:R>`;
    const [white, black] = (game.turn ? [':chess_pawn:', ''] : ['', ':chess_pawn:']);
    return `${white}[${stripPlayer(game.white)} - ${stripPlayer(game.black)}](${game.url})${black} ${due}`;
}

function formatClubs(teams) {
    return teams.slice(0, 10).map(team => `[${team.name}](https://chess.com/team/${team.id})`).join('\n');
}

function setHistory(embed, username) {
    const url = `https://api.chess.com/pub/player/${username}/games/archives`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => {
            const archive = response.data.archives.pop();
            return axios.get(archive, { headers: { Accept: 'application/json' } })
                .then(response => graphHistory(embed, response.data.games, username));
        });
}

async function graphHistory(embed, games, username) {
    const promise = formatHistory(games, username);
    return promise ? embed.setImage(await promise) : embed;
}

function formatHistory(games, username) {
    const now = new Date().getTime();
    const [data, history] = getSeries(games, username);
    if (data.length >= 1) {
        const domain = [Math.min(...data.map(point => point.t)), Math.max(...data.map(point => point.t))];
        const chart = new QuickChart().setConfig({
            type: 'line',
            data: { labels: domain, datasets: history.filter(series => series.data.length) },
            options: { scales: { xAxes: [{ type: 'time' }] } }
        });
        const url = chart.getUrl();
        return url.length <= 2000 ? url : chart.getShortUrl();
    }
}

function getSeries(games, username) {
    const data = [];
    const history = [];
    const series = games.map(game => { return { t: game.end_time * 1000, y: getRating(game, username) ?? 0 } });
    if (series.length) {
        data.push(...series);
        history.push({ label: 'Games', data: series });
    }
    return [data, history];
}

function getRating(game, username) {
    return [game.white, game.black].filter(player => player.username.toLowerCase() == username.toLowerCase()).map(player => player.rating)[0];
}

function stripPlayer(player) {
    return player.replace('https://api.chess.com/pub/player/','');
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
    var games = 0;
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostRecentMode = modes[i][0];
            mostRecentRating = modes[i][1];
        }
        if (modes[i][1].record)
            games += modes[i][1].record.win + modes[i][1].record.loss + modes[i][1].record.draw;
    }
    return [games, mostRecentMode, mostRecentRating];
}

function formatRating(rating, mode) {
    if (rating.last) {
        const games = rating.record.win + rating.record.loss + rating.record.draw;
        return `**${rating.last.rating}** ± **${2 * rating.last.rd} ** over **${fn.format(games)}** ${plural('game', games)}`;
    }
    if (rating.best)
        return `**${rating.best.score}** over **${fn.format(rating.best.total_attempts)}** ${plural('attempt', rating.best.total_attempts)}`;
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

// For sorting through modes... chess.com api does not put these in an array so we do it ourselves
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
