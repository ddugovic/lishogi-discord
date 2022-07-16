const ChessWebAPI = require('chess-web-api');
const { MessageEmbed } = require('discord.js');
const countryFlags = require('emoji-flags');
const fn = require('friendly-numbers');
const plural = require('plural');
const QuickChart = require('quickchart-js');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your chess.com username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    return new ChessWebAPI().getPlayer(username)
        .then(response => formatProfile(response.body, favoriteMode))
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
    const embed = new MessageEmbed()
        .setColor(0xFFFFFF);
    return setName(embed, user, firstName)
        .then(embed => setStats(embed, user, favoriteMode))
        .then(embed => { return user.is_streamer ? setStreamer(embed, user.twitch_url, firstName) : embed })
        .then(embed => setClubs(embed, user.username))
        .then(embed => setDailyChess(embed, user.username))
        .then(embed => { return { embeds: [ embed ] } });
}

function getFirstName(user) {
    return user.name ? user.name.split(' ')[0] : undefined;
}

function setName(embed, user, firstName) {
    const iso = user.country.split(/(?:\/)/).pop();
    return new ChessWebAPI().getCountry(iso)
        .then(response => {
            return embed
                .setAuthor({ name: formatName(user, response.body.name), iconURL: user.avatar, url: user.url })
                .setThumbnail(user.avatar)
                .setTitle(`Challenge ${formatNickname(firstName, response.body.code)} to a game!`)
                .setURL(`https://chess.com/play/${user.username}`);
        });
}

function formatName(user, name) {
    var name = user.name || user.username;
    if (user.title)
        name = `${user.title} ${name}`;
    if (user.location)
        name += ` (${user.location})`;
    else if (name)
        name += ` (${name})`;
    return name;
}

function formatNickname(firstName, code) {
    if (code) {
        const flag = getFlagEmoji(code);
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
    return new ChessWebAPI().getPlayerStats(user.username)
        .then(response => {
            const [games, mode, rating] = getMostRecentMode(response.body, favoriteMode);
            embed = embed.addFields(formatStats(embed, user.last_online, games, mode, rating));
            return games ? setHistory(embed, user.username) : embed;
        });
}

function formatStats(embed, lastOnline, games, mode, rating) {
    const category = title(mode.replace('chess_',''));
    if (games)
        return [
            { name: 'Games', value: `**${fn.format(games)}**`, inline: true },
            { name: category, value: formatRating(rating.best, rating.last, rating.record) ?? 'None', inline: true },
            { name: 'Last Login', value: `<t:${lastOnline}:R>`, inline: true }
       ];
    else
        return [
            { name: category, value: formatRating(rating.best, rating.last, rating.record) ?? 'None', inline: true },
            { name: 'Last Login', value: `<t:${lastOnline}:R>`, inline: true }
       ];
}

function setStreamer(embed, twitchUrl, firstName) {
    return new ChessWebAPI().getStreamers()
        .then(response => {
            const streamer = response.body.streamers.filter(streamer => streamer.twitch_url == twitchUrl)[0];
            return embed.setThumbnail(streamer.avatar)
                .setTitle(streamer.is_live ? `📡 Watch ${firstName} live on Twitch!` : `📡 Follow ${firstName} on Twitch!`)
                .setURL(twitchUrl);
        });
}

function setClubs(embed, username) {
    return new ChessWebAPI().getPlayerClubs(username)
        .then(response => {
            const clubs = response.body.clubs;
            return clubs.length ? embed.addField('Clubs', clubs.map(club => club.name).join('\n'), true) : embed;
        });
}

function setDailyChess(embed, username) {
    return new ChessWebAPI().getPlayerCurrentDailyChess(username)
        .then(response => {
            const games = response.body.games;
            return games.length ? embed.addField('Daily Chess', games.slice(0, 5).map(formatGame).join('\n\n'), true) : embed;
        });
}

function formatGame(game) {
    const status = game.move_by ? `due <t:${game.move_by}:R>` : `moved <t:${game.last_activity}:R>`;
    const [white, black] = (game.turn == 'white' ? [':chess_pawn:', ''] : ['', ':chess_pawn:']);
    return `${white}[${stripPlayer(game.white)} - ${stripPlayer(game.black)}](${game.url})${black}\n${status}`;
}

function formatClubs(teams) {
    return teams.slice(0, 10).map(team => `[${team.name}](https://chess.com/team/${team.id})`).join('\n');
}

function setHistory(embed, username) {
    return new ChessWebAPI().getPlayerMonthlyArchives(username)
        .then(response => {
            const archives = response.body.archives;
            if (archives.length) {
                return getGames(username, archives.slice(-2), [])
                    .then(games => graphHistory(embed, games, username));
	    }
	    return embed;
        });
}

async function getGames(username, archives, games) {
    const archive = archives.shift();
    const [year, month] = archive.split(/(?:\/)/).slice(-2);
    return new ChessWebAPI().getPlayerCompleteMonthlyArchives(username, year, month)
        .then(response => {
            games = games.concat(...response.body.games);
            return archives.length ? getGames(username, archives, games) : games;
        });
}

async function graphHistory(embed, games, username) {
    const promise = formatHistory(games, username);
    return promise ? embed.setImage(await promise) : embed;
}

function formatHistory(games, username) {
    const now = new Date().getTime();
    const [dates, history] = getSeries(games, username);
    if (dates.length >= 1) {
        const domain = [Math.min(...dates), Math.max(...dates)];
        const chart = new QuickChart().setConfig({
            type: 'line',
            data: { labels: domain, datasets: history.filter(series => series.data.length) },
            options: { scales: { xAxes: [{ type: 'time' }] } }
        });
        const url = chart.getUrl();
        return url.length <= 2000 ? url : chart.getShortUrl();
    }
}

function getSeries(document, username) {
    const dates = [];
    const history = [];
    for (const [category, games] of groupBy(document, getCategory).entries()) {
        const series = [];
        for (const [date, day] of groupBy(games, getDate).entries()) {
            const rating = Math.max(...day.map(game => getRating(game, username) ?? 0));
            dates.push(date);
            series.push({ t: date, y: rating });
        }
        history.push({ label: title(category), data: series });
    }
    return [dates, history];
}

function getCategory(game) {
    return game.rules == 'chess' ? game.time_class : game.rules;
}

function getDate(game) {
    return new Date(game.end_time * 1000).setUTCHours(0, 0, 0, 0);
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

function formatRating(best, last, record) {
    if (last) {
        const games = record.win + record.loss + record.draw;
        return `**${last.rating}** ± **${2 * last.rd} ** over **${fn.format(games)}** ${plural('game', games)}`;
    }
    if (best)
        return `**${best.score}** over **${fn.format(best.total_attempts)}** ${plural('attempt', best.total_attempts)}`;
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

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

function process(bot, msg, username) {
    profile(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return await profile(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
