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
            return 'You need to set your lichess username with setuser!';
    }
    const favoriteMode = user ? user.favoriteMode : '';
    const url = `https://lichess.org/api/user/${username}?trophies=true`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
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
        return user.lichessName;
}

// Returns a profile in discord markup of a user, returns nothing if error occurs.
function formatProfile(user, favoriteMode) {
    if (user.disabled)
        return 'This account is closed.';

    const username = user.username;
    const [country, firstName, lastName] = getCountryAndName(user.profile) ?? [];
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && countryFlags.countryCode(country))
        nickname = `${countryFlags.countryCode(country).emoji} ${nickname}`;
    const [color, author] = formatPlayer(user.title, name, user.patron, user.trophies, user.online, user.playing, user.streaming);

    var embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({name: author, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: user.playing ?? user.url})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png');
    if (user.online)
        embed = embed.setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lichess.org/?user=${username}#friend`);

    const [mode, rating] = getMostPlayedMode(user.perfs, user.count.rated ? favoriteMode : 'puzzle');
    if (unranked(mode, rating)) {
        embed = embed.addFields(formatStats(user.count, user.playTime, mode, rating));
        embed = setAbout(embed, username, user.profile, user.playTime);
        return setTeams(embed, username)
            .then(embed => { return user.perfs.puzzle ? setHistory(embed, username) : embed })
            .then(embed => { return { embeds: [ embed ] } });
    }
    return setStats(embed, user.username, user.count, user.playTime, mode, rating)
        .then(embed => { return setAbout(embed, username, user.profile, user.playTime) })
        .then(embed => { return setTeams(embed, username) })
        .then(embed => { return user.perfs.puzzle ? setHistory(embed, username) : embed })
        .then(embed => { return { embeds: [ embed ] } });
}

function formatPlayer(title, name, patron, trophies, online, playing, streaming) {
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
        status += playing.includes('white') ? '  ♙ Playing' : '  ♟️ Playing';
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

function setStats(embed, username, count, playTime, mode, rating) {
    const url = `https://lichess.org/api/user/${username}/perf/${mode}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => {
            return embed.addFields(formatStats(count, playTime, mode, rating, response.data));
        });
}

function setAbout(embed, username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lichess.org/@/${username})`);

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

function setTeams(embed, username) {
    const url = `https://lichess.org/api/team/of/${username}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => {
            const teams = formatTeams(response.data);
            return teams ? embed.addField('Teams', teams, true) : embed;
        });
}

function formatTeams(teams) {
    return teams.slice(0, 10).map(team => `[${team.name}](https://lichess.org/team/${team.id})`).join('\n');
}

function setHistory(embed, username) {
    const url = `https://lichess.org/api/user/${username}/rating-history`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => {
            const perfs = response.data;
            const url = `https://lichess.org/api/storm/dashboard/${username}?days=360`;
                return axios.get(url, { headers: { Accept: 'application/json' } })
                    .then(response => graphHistory(embed, perfs, response.data))
        })
}

async function graphHistory(embed, perfs, storms) {
    const promise = formatHistory(perfs, storms);
    return promise ? embed.setImage(await promise) : embed;
}

function formatHistory(perfs, storms) {
    for (days of [...Array(360).keys()]) {
        const time = new Date().getTime() - (24*60*60*1000 * (days + 1));
        const [data, history] = getSeries(perfs, time);
        const series = getStormSeries(storms, time);
        data.push(...series);
        history.push({ label: 'Storm', data: series });

        if (data.length >= (days == 359 ? 2 : 30)) {
            const dates = data.map(point => point.t);
            const minmax = [Math.min(...dates), Math.max(...dates)];
            const chart = new QuickChart().setConfig({
                type: 'line',
                data: { labels: minmax, datasets: history.filter(series => series.data.length) },
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
        const series = perf.points.map(point => { return { t: new Date(point[0], point[1]-1, point[2]).getTime(), y: point[3] } }).filter(point => (point.t >= time));
        if (series.length) {
            data.push(...series);
            history.push({ label: perf.name, data: series });
        }
    }
    return [data, history];
}

function getStormSeries(storms, time) {
    return storms.days.map(point => { return { t: new Date(point['_id']).getTime(), y: point.highest } }).filter(point => (point.t >= time));
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
            bio[i] = bio[i].replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);
        }
    }
    return bio.join(' ');
}

function getImage(text) {
    const match = text.match(/https:\/\/i.imgur.com\/\w+.\w+/);
    if (match)
        return match[0];
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
