const { EmbedBuilder } = require('discord.js');
const countryFlags = require('emoji-flags');
const fn = require('friendly-numbers');
const plural = require('plural');
const QuickChart = require('quickchart-js');
const formatClock = require('../lib/format-clock');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatSiteLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const { numberVariation } = require('../lib/format-variation');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lidraughts username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    const url = `https://lidraughts.org/api/user/${username}?trophies=true`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatProfile(json, favoriteMode))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.lidraughtsName;
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
async function formatProfile(user, favoriteMode) {
    if (user.disabled)
        return 'This account is closed.';

    const username = user.username;
    const [country, firstName, lastName] = getCountryAndName(user.profile) ?? [];
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && countryFlags.countryCode(country))
        nickname = `${countryFlags.countryCode(country).emoji} ${nickname}`;
    const [color, author] = formatUser(user.title, name, user.patron, user.trophies ?? [], user.online, user.playing, user.streaming);

    var embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({name: author, iconURL: 'https://lidraughts.org/assets/images/lidraughts-32-white.png', url: user.playing ?? user.url})
        .setThumbnail('https://lidraughts.org/assets/favicon.64.png');
    if (user.online)
        embed = embed.setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lidraughts.org/?user=${username}#friend`);

    const [mode, rating] = getMostPlayedMode(user.perfs, user.count.rated ? favoriteMode : 'puzzle');
    if (unranked(mode, rating))
        embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating));
    else
        embed = await setStats(embed, user.username, user.count, user.playTime, mode, rating);
    const about = formatAbout(embed, username, user.profile);
    if (about)
        embed = embed.addFields({ name: 'About', value: about });
    if (user.count.rated || user.perfs.puzzle)
        embed = await setHistory(embed, username);
    return setGames(embed, username);
}

function formatUser(title, name, patron, trophies, online, playing, streaming) {
    const color = streaming ? (playing ? 0xFF00FF : 0x7F007F) :
        playing ? 0x00FF00 :
        online ? 0x007F00 : 0x000000;
    if (title)
        name = `${title} ${name}`;
    var badges = patron ? '⛃' : '';
    for (const trophy of trophies) {
        badges +=
            trophy.type == 'developer' ? '🛠️':
            trophy.type == 'moderator' ? '🔱':
            trophy.type == 'verified' ? '✔️':
            trophy.type.startsWith('marathon') ? '🌐' :
            trophy.top == 1 ? '🥇' :
            trophy.top == 10 ? '🥈' :
            trophy.top ? '🥉' : '🏆';
    }

    // A player is a) streaming and playing b) streaming c) playing d) online e) offline
    var status = streaming ? '  📡 Streaming' : '';
    if (playing)
        status += playing.includes('white') ? '  ⚪ Playing' : '  ⚫ Playing';
    else if (!status && online)
        status = '  📶 Online';
    return [color, `${name}${status}  ${badges}`];
}

function unranked(mode, rating) {
    // Players whose RD is above this threshold are unranked
    const standard = ['ultrabullet','bullet','blitz','rapid','classical'];
    return true || mode == 'puzzle' || rating.rd > (standard.includes(mode) ? 75 : 65);
}

function getCountryAndName(profile) {
    if (profile)
        return [profile.country, profile.firstName, profile.lastName];
}

function setStats(embed, username, count, playTime, mode, rating) {
    const url = `https://lidraughts.org/api/user/${username}/perf/${mode}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => {
            return embed.addFields(formatStats(count, playTime, mode, rating, json));
        });
}

function formatAbout(embed, username, profile) {
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lidraughts.org/@/${username})`);

    const result = [links.join(' | ')];
    if (profile && profile.bio) {
        const image = getImage(profile.bio);
        if (image)
            embed = embed.setThumbnail(image);
        const bio = formatBio(profile.bio.split(/\s+/)).join(' ');
        if (bio)
            result.push(bio);
    }
    return result.join('\n');
}

function setHistory(embed, username) {
    const url = `https://lidraughts.org/api/user/${username}/rating-history`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => formatHistory(json))
        .then(image => image ? embed.setImage(image) : embed);
}

async function formatHistory(perfs) {
    const now = new Date();
    const today = now.setUTCHours(0, 0, 0, 0);
    for (const days of Array(91).keys()) {
        const time = today - (24*60*60*1000 * (90 - days));
        const [data, history] = filterHistory(perfs, time);
        if (data.length) {
            const chart = chartHistory(data, history, now);
            const url = chart.getUrl();
            if (url.length <= 2000)
                return url;
            if (days == 90)
                return await chart.getShortUrl();
        }
    }
}

function filterHistory(perfs, time) {
    const data = [];
    const history = [];
    for (perf of Object.values(perfs)) {
        const series = perf.points.map(point => { return { t: Date.UTC(point[0], point[1], point[2]), y: point[3] } }).filter(point => (point.t >= time));
        if (series.length) {
            data.push(...series);
            history.push({ label: perf.name, data: series });
        }
    }
    return [data, history];
}

function chartHistory(data, history, now) {
    const domain = [Math.min(...data.map(point => point.t)), now.getTime()];
    return new QuickChart().setConfig({
        type: 'line',
        data: { labels: domain, datasets: history.filter(series => series.data.length) },
        options: { scales: { xAxes: [{ type: 'time' }] } }
    });
}

function getMostPlayedMode(perfs, favoriteMode) {
    var modes = modesArray(perfs);
    var mostPlayedMode = modes[0][0];
    var mostPlayedRating = modes[0][1];
    for (var i = 0; i < modes.length; i++) {
        // exclude puzzle games, unless it is the only mode played by that user.
        if (modes[i][0] != 'puzzle' && modes[i][1].games > mostPlayedRating.games) {
            mostPlayedMode = modes[i][0];
            mostPlayedRating = modes[i][1];
        }
    }
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostPlayedMode = modes[i][0];
            mostPlayedRating = modes[i][1];
        }
    }
    return [mostPlayedMode, mostPlayedRating];
}

function formatProgress(progress) {
    return (progress > 0) ? ` ▲**${progress}**📈` : (progress < 0) ? ` ▼**${Math.abs(progress)}**📉` : '';
}

function formatRating(mode, r) {
    const games = `**${fn.format(r.games)}** ${plural((mode == 'puzzle' ? 'attempt' : 'game'), r.games)}`;
    return `**${r.rating}** ± **${2 * r.rd}** over ${games}`;
}

function formatStats(count, playTime, mode, rating, perf) {
    var category = title(mode);
    if (perf)
        category += ` ${formatPerf(perf)}`;
    category += formatProgress(rating.prog);
    if (count.all)
        return [
            { name: 'Games', value: `**${fn.format(count.rated)}** rated, **${fn.format(count.all - count.rated)}** casual`, inline: true },
            { name: category, value: formatRating(mode, rating), inline: true },
            { name: 'Time Played', value: formatTimePlayed(playTime), inline: true }
       ];
    else
        return [
            { name: category, value: formatRating(mode, rating), inline: true }
       ];
}

function formatTimePlayed(playTime) {
    const result = [formatSeconds(playTime ? playTime.total : 0)];
    if (playTime && playTime.total) {
        const duration = formatSeconds(playTime.tv).split(', ')[0];
        result.push(`:tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`)
    }
    return result.join('\n');
}

function formatPerf(perf) {
    if (perf.rank)
        return `#${perf.rank}`
    if (perf.percentile >= 98)
        return `(Top ${(100 - Math.floor(perf.percentile * 10) / 10).toFixed(1)}%)`;
    return `(Top ${(100 - Math.floor(perf.percentile)).toFixed(0)}%)`;
}

function formatBio(bio) {
    const social = /https?:\/\/(?!lichess\.org|lidraughts\.org|lidraughts\.org|playstrategy\.org)|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        bio[i] = formatSiteLinks(bio[i]);
    }
    return bio;
}

function getImage(text) {
    const match = text.match(/https:\/\/i.imgur.com\/\w+.\w+/);
    if (match)
        return match[0];
}

function setGames(embed, username) {
    const url = `https://lidraughts.org/api/games/user/${username}?max=3&opening=true&ongoing=true`;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' } })
        .then(response => response.text())
        .then(json => parseDocument(json))
        .then(games => embed.addFields({ name: `Recent ${plural('Game', games.length)}`, value: games.filter(game => game.status != 'aborted').map(formatGame).join('\n\n') }));
}

function formatGame(game) {
    const url = `https://lidraughts.org/${game.id}`;
    const status = formatStatus(game);
    const players = [game.players.white, game.players.black].map(formatPlayerName).join(' - ');
    const opening = game.moves ? `\n${formatOpening(game.opening, game.initialFen, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} ${status[0]} [${players}](${url}) ${status[1]} <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatStatus(game) {
    return [game.players.white.ratingDiff, game.players.black.ratingDiff].map(formatRatingDiff);
}

function formatRatingDiff(ratingDiff) {
    return (ratingDiff > 0) ? ` ▲**${ratingDiff}**` : (ratingDiff < 0) ? ` ▼**${Math.abs(ratingDiff)}**` : '';
}

function formatPlayerName(player) {
    return player.user ? formatUserName(player.user) : player.aiLevel ? `Engine level ${player.aiLevel}` : 'Anonymous';
}

function formatUserName(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function formatOpening(opening, initialFen, moves) {
    const ply = opening ? opening.ply : 10;
    const variation = numberVariation(moves.split(/ /).slice(0, ply));
    return opening ? `${opening.name} *${variation}*` : `*${variation}*`;
}

// For sorting through modes... lidraughts api does not put these in an array so we do it ourselves
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

function title(str) {
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
