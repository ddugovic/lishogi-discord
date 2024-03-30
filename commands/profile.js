const { EmbedBuilder } = require('discord.js');
const fn = require('friendly-numbers');
const plural = require('plural');
const formatClock = require('../lib/format-clock');
const formatCountry = require('../lib/format-country');
const { formatSocialLinks } = require('../lib/format-links');
const { formatName, formatNickname } = require('../lib/format-name');
const { formatError } = require('../lib/format-pages');
const { formatSiteLinks, getSiteLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const { formatHandicap, formatVariant } = require('../lib/format-variant');
const { formatOpening } = require('../lib/format-variation');
const graphPerfHistory = require('../lib/graph-perf-history');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function profile(author, username, interaction) {
    const user = await User.findById(author.id).exec();
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lishogi username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    const url = `https://lishogi.org/api/user/${username}?trophies=true`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { trophies: true } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatProfile(json, favoriteMode))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in profile(${author.username}, ${username}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.lishogiName;
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
async function formatProfile(user, favoriteMode) {
    if (user.disabled)
        return 'This account is closed.';

    const [mode, rating] = getMostPlayedMode(user.perfs, user.count.rated ? favoriteMode : 'puzzle');
    const perf = unranked(mode, rating) ? null : getPerf(user.username, mode);
    const requests = [ getUserStatus(user.username), perf, getGames(user.username) ];
    if (user.count.rated || user.perfs.puzzle) {
        requests.push(getHistory(user.username));
        if (user.perfs.storm && user.perfs.storm.runs)
            requests.push(getStormHistory(user.username));
    }
    const responses = await Promise.all(requests);
    const status = responses[0][0];

    const [country, firstName, lastName] = getCountryAndName(user.profile) ?? [];
    const name = formatName(firstName, lastName) ?? user.username;
    const [color, author] = formatUser(user.title, name, user.patron, user.trophies ?? [], user.online, user.playing, user.streaming);

    var embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({name: author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: user.playing ?? user.url})
        .setThumbnail(user.title == 'BOT' ? 'https://lishogi1.org/assets/images/icons/bot.png' : 'https://lishogi1.org/assets/logo/lishogi-favicon-64.png');
    if (user.online) {
        var nickname = formatNickname(firstName, lastName) ?? user.username;
        if (country) {
            const countryFlag = formatCountry(country);
            if (countryFlag)
                nickname = `${countryFlag} ${nickname}`;
        }
        embed = embed.setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
            .setURL(`https://lishogi.org/?user=${user.username}#friend`);
    }
    embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating, responses[1]));

    const profile = user.profile;
    if (profile && (profile.links || profile.bio))
        embed = embed.addFields({ name: user.patron ? '⛩️ About' : '☗ About', value: formatAbout(embed, user.username, profile) });

    if (user.count.all) {
        const games = responses[2];
        const fields = await Promise.all(games.filter(game => game.status != 'aborted').map(formatGame));
        embed = embed.addFields({ name: `:crossed_swords: Recent ${plural('Game', fields.length)}`, value: fields.join('\n') });
    }
    if (user.count.rated || user.perfs.puzzle) {
        const image = await formatHistory(...responses.slice(3));
        if (image)
            embed = embed.setImage(image);
    }
    return embed;
}

function getUserStatus(username) {
    const url = `https://lishogi.org/api/users/status?ids=${username}&withGameIds=true`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { ids: username, withGameIds: true } })
        .then(response => response.json());
}

function formatUser(title, name, patron, trophies, online, playing, streaming) {
    const color = streaming ? (playing ? 0xFF00FF : 0x7F007F) :
        playing ? 0x00FF00 :
        online ? 0x007F00 : 0x000000;
    if (title)
        name = `${title} ${name}`;
    var badges = patron ? '⛩️' : '';
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
        status += playing.includes('sente') ? '  ☗ Playing' : '  ☖ Playing';
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

function getPerf(username, mode) {
    const url = `https://lishogi.org/api/user/${username}/perf/${mode}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json());
}

function formatAbout(embed, username, profile) {
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    if (profile && profile.bio)
        links.unshift(...getSiteLinks(profile.bio));
    links.unshift(`[Profile](https://lishogi.org/@/${username})`);

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

function getHistory(username) {
    const url = `https://lishogi.org/api/user/${username}/rating-history`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json());
}

function getStormHistory(username) {
    const url = `https://lishogi.org/api/storm/dashboard/${username}?days=90`;
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
            const variant = perf.name.toLowerCase();
            data.push(...series);
            history.push({ label: formatVariant(variant), data: series });
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

function getGames(username) {
    const url = `https://lishogi.org/api/games/user/${username}?max=3&opening=true&ongoing=true`;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' }, params: { max: 3, opening: 'true', ongoing: 'true' } })
        .then(response => response.text())
        .then(json => parseDocument(json));
}

async function formatGame(game, username) {
    const winner = game.winner ? game.players[`${game.winner}`].user : undefined;
    const outcome = winner && winner.name == username ? ':white_circle:' : game.winner ? ':black_circle:' : ':hourglass:';
    const players = [game.players.sente, game.players.gote].map(formatPlayerName).join(' - ');
    const url = `https://lishogi.org/${game.id}`;
    const status = formatStatus(game);
    const opening = game.moves ? `${await formatOpening(game.variant, game.opening, game.initialSfen, game.moves)}` : '';
    return `${outcome} ${formatClock(game.clock, game.daysPerTurn)} ${status[0]} [${players}](${url}) ${status[1]} (${formatHandicap(game.variant, game.initialSfen)}) <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatStatus(game) {
    return [game.players.sente.ratingDiff, game.players.gote.ratingDiff].map(formatRatingDiff);
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

function title(str) {
    return str.split(/_/)
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, username) {
    profile(msg.author, username).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const username = interaction.options.getString('username') || await getName(interaction.user);
    if (!username)
        return await interaction.reply({ content: 'You need to set your lishogi username with setuser!', ephemeral: true });
    await interaction.deferReply();
    await interaction.editReply(await profile(interaction.user, username, interaction));
}

module.exports = {process, interact};
