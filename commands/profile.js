const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const fn = require('friendly-numbers');
const plural = require('plural');
const formatClock = require('../lib/format-clock');
const formatCountry = require('../lib/format-country');
const { formatSocialLinks } = require('../lib/format-links');
const { formatName, formatNickname } = require('../lib/format-name');
const { formatSiteLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const { formatSanVariation } = require('../lib/format-variation');
const graphPerfHistory = require('../lib/graph-perf-history');
const parseDocument = require('../lib/parse-document');
const { parseFeed, formatContent, getContent, getURL } = require('../lib/parse-feed');
const User = require('../models/User');

async function profile(author, username) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lichess username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    const url = `https://lichess.org/api/user/${username}`;
    return axios.get(url, { headers: { Accept: 'application/json' }, params: { trophies: true } })
        .then(response => formatProfile(response.data, favoriteMode))
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
        return user.lichessName;
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
async function formatProfile(user, favoriteMode) {
    if (user.disabled)
        return 'This account is closed.';

    const [mode, rating] = getMostPlayedMode(user.perfs, user.count.rated ? favoriteMode : 'puzzle');
    const perf = unranked(mode, rating) ? null : getPerf(user.username, mode);
    const requests = [ getStatus(user.username), perf, getBlog(user.username) ];
    if (user.count.rated || user.perfs.puzzle) {
        requests.push(getHistory(user.username));
        if (user.perfs.storm && user.perfs.storm.runs)
            requests.push(getStormHistory(user.username));
    }
    const responses = await Promise.all(requests);
    const status = responses[0][0];

    const [country, firstName, lastName] = getCountryAndName(user.profile) ?? [];
    const name = formatName(firstName, lastName) ?? user.username;
    const [color, author] = formatUser(user.title, name, user.patron, user.trophies ?? [], status.online, status.playing, status.streaming);
    const url = status.playing ? `https://lichess.org/${status.playingId}` : user.url;

    var embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({name: author, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: url})
        .setThumbnail(user.title == 'BOT' ? 'https://lichess1.org/assets/images/icons/bot.png' : 'https://lichess1.org/assets/logo/lichess-favicon-64.png');
    if (status.online) {
        var nickname = formatNickname(firstName, lastName) ?? user.username;
        if (country) {
            const countryName = formatCountry(country);
            if (countryName)
                nickname = `${countryName} ${nickname}`;
        }
        embed = embed.setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
            .setURL(`https://lichess.org/?user=${user.username}#friend`);
    }
    embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating, responses[1]));

    const profile = user.profile;
    if (profile && (profile.links || profile.bio))
        embed = embed.addFields({ name: user.patron ? ':unicorn: About' : ':horse: About', value: formatAbout(embed, user.username, profile) });

    const blog = responses[2];
    if (blog.entry)
        embed = embed.addFields({ name: `:pencil: Recent Blog`, value: blog.entry.slice(0, 3).map(formatEntry).join('\n\n') });
    if (user.count.rated || user.perfs.puzzle) {
        const image = await formatHistory(...responses.slice(3));
        if (image)
            embed = embed.setImage(image);
    }
    return user.count.all ? setGames(embed, user.username) : embed;
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

function getCountryAndName(profile) {
    if (profile)
        return [profile.country, profile.firstName, profile.lastName];
}

function getStatus(username) {
    const url = `https://lichess.org/api/users/status`;
    return axios.get(url, { headers: { Accept: 'application/json' }, params: { ids: username, withGameIds: true } })
        .then(response => response.data);
}

function getPerf(username, mode) {
    const url = `https://lichess.org/api/user/${username}/perf/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => response.data);
}

function formatAbout(embed, username, profile) {
    const links = formatSocialLinks(profile.links ?? profile.bio ?? '');
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
    return axios.get(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => parseFeed(response.data));
}

function formatEntry(entry) {
    const published = Math.floor(new Date(entry.published).getTime() / 1000);
    const url = getURL(entry);
    const content = getContent(entry);
    return `<t:${published}:R> [${entry.title}](${url}) *${formatContent(content, 80)}*`;
}

function getHistory(username) {
    const url = `https://lichess.org/api/user/${username}/rating-history`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => response.data);
}

function getStormHistory(username) {
    const url = `https://lichess.org/api/storm/dashboard/${username}`;
    return axios.get(url, { headers: { Accept: 'application/json' }, params: { days: 90 } })
        .then(response => response.data);
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
    const social = /https?:\/\/(?!lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
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
    const url = `https://lichess.org/api/games/user/${username}`;
    return axios.get(url, { headers: { Accept: 'application/x-ndjson' }, params: { max: 3, opening: true, ongoing: true } })
        .then(response => parseDocument(response.data))
        .then(games => games.filter(game => game.status != 'aborted').map(formatGame))
        .then(fields => embed.addFields({ name: `:crossed_swords: Recent ${plural('Game', fields.length)}`, value: fields.join('\n\n') }));
}

function formatGame(game) {
    const clock = game.clock;
    const url = `https://lichess.org/${game.id}`;
    const status = formatStatus(game);
    const players = [game.players.white, game.players.black].map(formatPlayerName).join(' - ');
    const opening = game.moves ? `\n${formatOpening(game.opening, game.initialFen, game.moves)}` : '';
    return `${formatClock(clock ? clock.initial : 0, clock ? clock.increment : 0, game.daysPerTurn)} ${status[0]} [${players}](${url}) ${status[1]} <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
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

function formatOpening(opening, initialFen, moves) {
    const ply = opening ? opening.ply : 10;
    const variation = formatSanVariation(initialFen, moves.split(/ /).slice(0, ply));
    return opening ? `${opening.name} *${variation}*` : `*${variation}*`;
}

// For sorting through modes... lichess api does not put these in an array so we do it ourselves
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
    return str.split(/_/)
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, username) {
    profile(msg.author, username).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.editReply(await profile(interaction.user, interaction.options.getString('username')));
}

module.exports = {process, interact};
