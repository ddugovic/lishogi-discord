const ChessWebAPI = require('chess-web-api');
const { EmbedBuilder } = require('discord.js');
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
            return 'You need to set your Chess.com username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    const api = new ChessWebAPI();
    return api.getPlayer(username)
        .then(response => formatProfile(api, response.body, favoriteMode))
        .then(embed => { return { embeds: [ embed ] } })
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
function formatProfile(api, user, favoriteMode) {
    if (user.status == 'closed' || user.status == 'closed:fair_play_violations')
        return 'This account is closed.';

    const firstName = getFirstName(user) || title(user.username);
    /*const color = streaming ? (playing ? 0xFF00FF : 0x7F007F) :
        playing ? 0x00FF00 :
        online ? 0x007F00 : 0x000000;*/
    const embed = new EmbedBuilder()
        .setColor(0xFFFFFF);
    return setName(api, embed, user, firstName)
        .then(embed => setStats(api, embed, user, favoriteMode))
        .then(embed => { return user.is_streamer ? setStreamer(api, embed, user.twitch_url, firstName) : embed })
        .then(embed => setClubs(api, embed, user.username))
        .then(embed => setDailyChess(api, embed, user.username));
}

function getFirstName(user) {
    return user.name ? user.name.split(' ')[0] : undefined;
}

function setName(api, embed, user, firstName) {
    const iso = user.country.split(/(?:\/)/).pop();
    return api.getCountry(iso)
        .then(response => {
            return embed
                .setAuthor({ name: formatName(user, response.body.name), iconURL: user.avatar, url: user.url })
                .setThumbnail(user.avatar)
                .setTitle(`Challenge ${formatNickname(firstName, response.body.code)} to a game!`)
                .setURL(`https://chess.com/play/${user.username}`);
        });
}

function formatName(user, fullname) {
    var name = user.name || user.username;
    if (user.title)
        name = `${user.title} ${name}`;
    if (user.location)
        name += ` (${user.location})`;
    else if (fullname)
        name += ` (${fullname})`;
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

function setStats(api, embed, user, favoriteMode) {
    return api.getPlayerStats(user.username)
        .then(response => {
            const [games, mode, rating] = getMostRecentMode(response.body, favoriteMode);
            embed = embed.addFields(formatStats(embed, user.last_online, games, mode, rating));
            if (games)
                return api.getPlayerMonthlyArchives(user.username)
                    .then(response => getGames(api, user.username, response.body.archives, []))
                    .then(games => setHistory(embed, games, user.username)) ?? embed;
            return embed;
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

function setStreamer(api, embed, twitchUrl, firstName) {
    return api.getStreamers()
        .then(response => {
            const streamer = response.body.streamers.filter(streamer => streamer.twitch_url == twitchUrl)[0];
            return embed.setThumbnail(streamer.avatar)
                .setTitle(streamer.is_live ? `📡 Watch ${firstName} live on Twitch!` : `📡 Follow ${firstName} on Twitch!`)
                .setURL(twitchUrl);
        });
}

function setClubs(api, embed, username) {
    return api.getPlayerClubs(username)
        .then(response => {
            const clubs = response.body.clubs;
            return clubs.length ? embed.addFields({ name: 'Clubs', value: clubs.map(club => club.name).join('\n'), inline: true }) : embed;
        });
}

function setDailyChess(api, embed, username) {
    return api.getPlayerCurrentDailyChess(username)
        .then(response => {
            const games = response.body.games;
            return games.length ? embed.addFields({ name: 'Daily Chess', value: games.slice(0, 5).map(formatGame).join('\n\n'), inline: true }) : embed;
        });
}

function formatGame(game) {
    const status = game.move_by ? `due <t:${game.move_by}:R>` : `moved <t:${game.last_activity}:R>`;
    const [white, black] = (game.turn == 'white' ? [':chess_pawn:', ''] : ['', ':chess_pawn:']);
    return `${white}[${stripPlayer(game.white)} - ${stripPlayer(game.black)}](${game.url})${black}\n${status}`;
}

function stripPlayer(player) {
    return player.replace('https://api.chess.com/pub/player/','');
}

function formatClubs(teams) {
    return teams.slice(0, 10).map(team => `[${team.name}](https://chess.com/team/${team.id})`).join('\n');
}

async function getGames(api, username, archives, games) {
    const archive = archives.shift();
    const [year, month] = archive.split(/(?:\/)/).slice(-2);
    return api.getPlayerCompleteMonthlyArchives(username, year, month)
        .then(response => {
            games = games.concat(...response.body.games.filter(game => game.rated));
            return archives.length && games.length < 50 ? getGames(api, username, archives, games) : games;
        });
}

async function setHistory(embed, games, username) {
    const promise = formatHistory(games, username);
    if (promise)
        return embed.setImage(await promise);
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

function getMostRecentMode(stats, favoriteMode) {
    const entries = Object.entries(stats);
    var [mostRecentMode, mostRecentRating] = entries[0];
    var games = 0;
    for (const [mode, stat] of entries) {
        if (stat.last && stat.last.date > mostRecentRating.last.date)
            [mostRecentMode, mostRecentRating] = [mode, stat];
        if (stat.record)
            games += stat.record.win + stat.record.loss + stat.record.draw;
    }
    for (const [mode, stat] of entries)
        if (mode.toLowerCase() == favoriteMode)
            [mostRecentMode, mostRecentRating] = [mode, stat];
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

async function interact(interaction) {
    interaction.editReply(await profile(interaction.user, interaction.options.getString('username'), interaction));
}

module.exports = {process, interact};
