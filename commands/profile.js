const { EmbedBuilder } = require('discord.js');
const fn = require('friendly-numbers');
const plural = require('plural');
const formatClock = require('../lib/format-clock');
const formatError = require('../lib/format-error');
const { formatSocialLinks } = require('../lib/format-links');
const { formatName, formatNickname } = require('../lib/format-name');
const { formatChunks } = require('../lib/format-pages');
const { formatSiteLinks, getSiteLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const { formatOpening } = require('../lib/format-variation');
const graphPerfHistory = require('../lib/graph-perf-history');
const parseDocument = require('../lib/parse-document');
const { formatContent, getURL } = require('../lib/parse-feed');
const Parser = require('rss-parser');
const User = require('../models/User');

async function profile(username, favoriteMode, interaction) {
    const url = `https://lichess.org/api/user/${username}?trophies=true`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { trophies: true } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatProfile(json, favoriteMode))
        .then(embed => formatChunks([embed], interaction, 'Player not found!'))
        .catch(error => {
            console.log(`Error in profile(${username}, ${favoriteMode}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
async function formatProfile(user, favoriteMode) {
    if (user.disabled)
        return 'This account is closed.';

    const [mode, rating] = getMostPlayedMode(user.perfs, user.count.rated ? favoriteMode : 'puzzle');
    const perf = unranked(mode, rating) ? null : getPerf(user.username, mode);
    const requests = [ getUserStatus(user.username), perf, getBlog(user.username), getGames(user.username) ];
    if (user.count.rated || user.perfs.puzzle) {
        requests.push(getHistory(user.username));
        if (user.perfs.storm && user.perfs.storm.runs)
            requests.push(getStormHistory(user.username));
    }
    const responses = await Promise.all(requests);
    const status = responses[0][0];

    const [firstName, lastName] = getProfileName(user.profile) ?? [];
    const name = formatName(firstName, lastName) ?? user.username;
    const [color, author] = formatUser(user.title, name, user.patron, user.trophies ?? [], status.online, status.playing, status.streaming);
    const url = status.playing ? `https://lichess.org/${status.playingId}` : user.url;

    var embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({name: author, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: url})
        .setThumbnail(user.title == 'BOT' ? 'https://lichess1.org/assets/images/icons/bot.png' : 'https://lichess1.org/assets/logo/lichess-favicon-64.png');
    if (status.online) {
        var nickname = formatNickname(firstName, lastName) ?? user.username;
        embed = embed.setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
            .setURL(`https://lichess.org/?user=${user.username}#friend`);
    }
    embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating, responses[1]));

    const profile = user.profile;
    if (profile && (profile.links || profile.bio))
        embed = embed.addFields({ name: user.patron ? ':unicorn: About' : ':horse: About', value: formatAbout(embed, user.username, profile) });

    const blog = responses[2];
    if (blog.items)
        embed = embed.addFields({ name: `:pencil: Blog`, value: parseDocument(blog.items).slice(0, 3).map(formatEntry).join('\n') });
    if (user.count.all) {
        const games = responses[3];
        const fields = await Promise.all(games.filter(game => game.status != 'aborted').map(formatGame));
        embed = embed.addFields({ name: `:crossed_swords: ${plural('Game', fields.length)}`, value: fields.join('\n') });
    }
    if (user.count.rated || user.perfs.puzzle) {
        const image = await formatHistory(...responses.slice(4));
        if (image)
            embed = embed.setImage(image);
    }
    return embed;
}

function getUserStatus(username) {
    const url = `https://lichess.org/api/users/status?ids=${username}&withGameIds=true`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { ids: username, withGameIds: true } })
        .then(response => response.json());
}

function formatUser(title, name, patron, trophies, online, playing, streaming) {
    const color = streaming ? (playing ? 0xFF00FF : 0x7F007F) :
        playing ? 0x00FF00 :
        online ? 0x007F00 : 0x000000;
    if (title)
        name = `${title} ${name}`;
    var badges = patron ? '🦄' : '';
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
        status += '  ♙ Playing';
    else if (!status && online)
        status = '  📶 Online';
    return [color, `${name}${status}  ${badges}`];
}

function unranked(mode, rating) {
    // Players whose RD is above this threshold are unranked
    const correspondence = ['correspondence','puzzle'];
    const standard = ['ultrabullet','bullet','blitz','rapid','classical'];
    return correspondence.includes(mode) || rating.rd > (standard.includes(mode) ? 75 : 65);
}

function getProfileName(profile) {
    if (profile)
        return [profile.firstName, profile.lastName];
}

function getPerf(username, mode) {
    const url = `https://lichess.org/api/user/${username}/perf/${mode}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json());
}

function formatAbout(embed, username, profile) {
    const links = formatSocialLinks(profile.links ?? profile.bio ?? '');
    if (profile && profile.bio)
        links.unshift(...getSiteLinks(profile.bio));
    links.unshift(`[Profile](https://lichess.org/@/${username})`);

    const result = [links.join(' | ')];
    if (profile.bio) {
        const image = getImage(profile.bio);
        if (image)
            embed = embed.setThumbnail(image);
        const bio = formatBio(profile.bio.split(/\s+/)).join(' ');
        if (bio)
            result.push(bio);
    }
    return result.join('\n');
}

function getBlog(username) {
    const url = `https://lichess.org/@/${username}/blog.atom`;
    return new Parser().parseURL(url)
}

function formatEntry(entry) {
    const published = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    return `<t:${published}:R> [${entry.title}](${entry.link}) *${formatContent(entry.contentSnippet, 80)}*`;
}

function getHistory(username) {
    const url = `https://lichess.org/api/user/${username}/rating-history`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json());
}

function getStormHistory(username) {
    const url = `https://lichess.org/api/storm/dashboard/${username}?days=90`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { days: 90 } })
        .then(response => response.json());
}

function formatHistory(perfs, storms) {
    const now = new Date();
    const today = now.setUTCHours(0, 0, 0, 0);
    var chart;
    for (const days of Array(91).keys()) {
        const [data, history] = filterHistory(perfs, storms, today - (24*60*60*1000 * (90 - days)));
        if (! data.length)
            break;
        chart = graphPerfHistory(data, history, now);
        const url = chart.getUrl();
        if (url.length <= 2000)
            return url;
    }
    if (chart)
        return chart.getShortUrl();
}

function filterHistory(perfs, storms, time) {
    const [data, history] = getSeries(perfs, time);
    if (storms) {
        const series = getStormSeries(storms, time);
        data.push(...series);
        history.push({ label: 'Storm', data: series });
    }
    return [data, history];
}

function getSeries(perfs, time) {
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

function getStormSeries(storms, time) {
    return storms.days.map(point => { return { t: getTimestamp(point['_id']), y: point.highest } }).filter(point => (point.t >= time));
}

function getTimestamp(date) {
    const [year, month, day] = date.split('/', 3);
    return Date.UTC(year, month-1, day);
}

function getMostPlayedMode(perfs, favoriteMode) {
    var mostPlayedMode;
    var mostPlayedRating;
    for (const [mode, perf] of Object.entries(perfs)) {
        if (mode.toLowerCase() == favoriteMode)
            return [mode, perf];
        // exclude puzzle games, unless it is the only mode played by that user.
        if (mode != 'puzzle' && (mostPlayedRating == undefined || perf.games > mostPlayedRating.games)) {
            mostPlayedMode = mode;
            mostPlayedRating = perf;
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
            { name: 'Games', value: `**${fn.format(count.rated)}** rated\n**${fn.format(count.all - count.rated)}** casual`, inline: true },
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
        const duration = formatSeconds(playTime.tv).split(/, /, 2)[0];
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
    const social = /https?:\/\/(?!lichess\.org|lidraughts\.org|lichess\.org|playstrategy\.org)|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
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

function getGames(username) {
    const url = `https://lichess.org/api/games/user/${username}?accuracy=true&clocks=false&max=3&opening=true&ongoing=true`;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' }, params: { max: 3, opening: true, ongoing: true } })
        .then(response => response.text())
        .then(text => parseDocument(text));
}

async function formatGame(game) {
    const url = `https://lichess.org/${game.id}`;
    const status = formatStatus(game);
    const players = [game.players.white, game.players.black].map(formatPlayerName).join(' - ');
    const opening = game.moves ? `\n${await formatOpening(game.opening, game.initialFen, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} ${status[0]} [${players}](${url}) ${status[1]} <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatStatus(game) {
    return [game.players.white.ratingDiff, game.players.black.ratingDiff].map(formatRatingDiff);
}

function formatRatingDiff(ratingDiff) {
    return (ratingDiff > 0) ? ` ▲**${ratingDiff}**` : (ratingDiff < 0) ? ` ▼**${Math.abs(ratingDiff)}**` : '';
}

function formatPlayerName(player) {
    return player.user ? formatUserName(player.user) : player.aiLevel ? `Level ${player.aiLevel}` : 'Anonymous';
}

function formatUserName(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function title(str) {
    return str.split(/_/)
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

async function process(bot, msg, username) {
    const user = await User.findById(msg.author.id).exec();
    if (!(username || user?.lichessName))
        return 'You need to set your lichess username with setuser!';
    profile(username || user?.lichessName, user?.favoriteMode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const user = await User.findById(interaction.user.id).exec();
    const username = interaction.options.getString('username') || user?.lichessName;
    if (!username)
        return 'You need to set your lichess username with setuser!';
    return profile(username, user?.favoriteMode, interaction);
}

module.exports = {process, interact};
