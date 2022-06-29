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
    const embed = new Discord.MessageEmbed()
        .setColor(0xFFFFFF);
    return setName(embed, user, firstName)
        .then(embed => setStats(embed, user, favoriteMode))
        .then(embed => setStreamer(embed, user, firstName))
        .then(embed => setClubs(embed, user.username))
        .then(embed => setGames(embed, user.username))
        .then(embed => { return { embeds: [ embed ] } });

    /*
    const username = user.username;
    const [country, firstName, lastName] = getCountryAndName(user.profile) ?? [];
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && countryFlags.countryCode(country))
        nickname = `${countryFlags.countryCode(country).emoji} ${nickname}`;
    const [color, author] = formatPlayer(user.title, name, user.patron, user.trophies ?? [], user.online, user.playing, user.streaming);

    var embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({name: author, iconURL: 'https://chess.com1.org/assets/logo/chess.com-favicon-32-invert.png', url: user.playing ?? user.url})
        .setThumbnail('https://chess.com1.org/assets/logo/chess.com-favicon-64.png');
    if (user.online)
        embed = embed.setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://chess.com/?user=${username}#friend`);

    const [mode, rating] = getMostPlayedMode(user.perfs, user.count.rated ? favoriteMode : 'puzzle');
    if (unranked(mode, rating)) {
        embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating));
        embed = setAbout(embed, username, user.profile, user.playTime);
        return setClubs(embed, username)
            .then(embed => { return user.perfs.puzzle ? setHistory(embed, username) : embed })
            .then(embed => { return { embeds: [ embed ] } });
    }
    return setStats(embed, user.username, user.count, user.playTime, mode, rating)
        .then(embed => { return setAbout(embed, username, user.profile, user.playTime) })
        .then(embed => { return setClubs(embed, username) })
        .then(embed => { return user.perfs.puzzle ? setHistory(embed, username) : embed })
        .then(embed => { return { embeds: [ embed ] } });
    */
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

function unranked(mode, rating) {
    // Players whose RD is above this threshold are unranked
    const standard = ['ultrabullet','bullet','blitz','rapid','classical'];
    return true || mode == 'puzzle' || rating.rd > (standard.includes(mode) ? 75 : 65);
}

function getCountryAndName(profile) {
    if (profile)
        return [profile.country, profile.firstName, profile.lastName];
}

function setRating(embed, username, count, playTime, mode, rating) {
    const url = `https://chess.com/api/user/${username}/perf/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
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
            return embed.addFields(formatStats(embed, user, response, favoriteMode));
        });
}

function formatStats(embed, user, response, favoriteMode) {
    const [mode, rating] = getMostRecentMode(response.data, favoriteMode);
    const category = title(mode.replace('chess_',''));
    return [
        { name: 'Followers', value: `**${fn.format(user.followers)}**`, inline: true },
        { name: category, value: rating.last ? formatRecord(mode, rating.last, rating.record) : 'None', inline: true },
        { name: 'Last Login', value: `<t:${user.last_online}:R>`, inline: true }
   ];
}

function setStreamer(embed, user, firstName) {
    if (user.is_streamer) {
        embed = embed
            .setTitle(`Watch ${firstName} on Twitch!`)
            .setURL(user.twitch_url);
    }
    return embed
}

function setAbout(embed, username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://chess.com/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    if (profile && profile.bio) {
        const image = getImage(profile.bio);
        if (image)
            embed = embed.setThumbnail(image);
        const bio = formatBio(profile.bio.split(/\s+/));
        if (bio)
            result.push(bio);
    }
    return embed.addField('About', result.join('\n'), true);
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
            return games.length ? embed.addField('Games', games.slice(0, 5).map(formatGame).join('\n'), true) : embed;
        });
}

function formatGame(game) {
    const due = game.move_by ? `due <t:${game.move_by}:R>` : `last move <t:${game.last_activity}:R>`;
    const [white, black] = (game.turn ? [':chess_pawn:', ''] : ['', ':chess_pawn:']);
    return `${white}[${formatPlayer(game.white)} - ${formatPlayer(game.black)}](${game.url})${black} ${due}`;
}

function formatClubs(teams) {
    return teams.slice(0, 10).map(team => `[${team.name}](https://chess.com/team/${team.id})`).join('\n');
}

function setHistory(embed, username) {
    const url = `https://chess.com/api/user/${username}/rating-history`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => graphHistory(embed, response.data))
}

async function graphHistory(embed, perfs, storms) {
    const promise = formatHistory(perfs, storms);
    return promise ? embed.setImage(await promise) : embed;
}

function formatHistory(perfs) {
    const now = new Date().getTime();
    for (days of [...Array(360).keys()]) {
        const time = now - (24*60*60*1000 * (days + 1));
        const [data, history] = getSeries(perfs, time);

        if (data.length >= (days == 359 ? 1 : 30)) {
            const domain = [Math.min(...data.map(point => point.t)), now];
            const chart = new QuickChart().setConfig({
                type: 'line',
                data: { labels: domain, datasets: history.filter(series => series.data.length) },
                options: { scales: { xAxes: [{ type: 'time' }] } }
            });
            const url = chart.getUrl();
            return url.length <= 2000 ? url : chart.getShortUrl();
        }
    }
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

function formatPlayer(player) {
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
    for (var i = 0; i < modes.length; i++) {
        if (modes[i][0].toLowerCase() == favoriteMode) {
            mostRecentMode = modes[i][0];
            mostRecentRating = modes[i][1];
        }
    }
    return [mostRecentMode, mostRecentRating];
}

function formatRecord(mode, last, record) {
    const games = record.win + record.loss + record.draw;
    const puzzleModes = ['lessons', 'puzzle_rush', 'tactics'];
    return `**${last.rating}** ± **${(2 * last.rd)}** over **${fn.format(games)}** ${plural((puzzleModes.includes(mode) ? 'attempt' : ' game'), games)}`;
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function formatRating(count, playTime, mode, rating, perf) {
    var category = title(mode);
    if (perf)
        category += ` ${formatPerf(perf)}`;
    category += formatProgress(rating.prog);
    if (count.all)
        return [
            { name: 'Games', value: `**${fn.format(count.rated)}** rated, **${fn.format(count.all - count.rated)}** casual`, inline: true },
            { name: category, value: formatRating(mode, rating), inline: true },
            { name: 'Time Played', value: formatSeconds(playTime ? playTime.total : 0), inline: true }
       ];
    else
        return [
            { name: category, value: formatRating(mode, rating), inline: true }
       ];
}

function formatPerf(perf) {
    if (perf.rank)
        return `#${perf.rank}`
    if (perf.percentile >= 98)
        return `(Top ${(100 - Math.floor(perf.percentile * 10) / 10).toFixed(1)}%)`;
    return `(Top ${(100 - Math.floor(perf.percentile)).toFixed(0)}%)`;
}

function formatBio(bio) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    const username = /@(\w+)/g;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        for (match of bio[i].matchAll(username)) {
            bio[i] = bio[i].replace(match[0], `[${match[0]}](https://chess.com/@/${match[1]})`);
        }
    }
    return bio.join(' ');
}

function getImage(text) {
    const match = text.match(/https:\/\/i.imgur.com\/\w+.\w+/);
    if (match)
        return match[0];
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
