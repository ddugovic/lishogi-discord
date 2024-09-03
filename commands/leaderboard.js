const countryFlags = require('emoji-flags');
const { EmbedBuilder } = require('discord.js');
const { emailRegex } = import('email-regex');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');
const { formatSiteLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function leaderboard(author, mode, interaction) {
    if (!mode)
        mode = await getMode(author) || 'blitz';
    const url = `https://playstrategy.org/player/top/150/${mode}`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/vnd.playstrategy.v3+json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatLeaders(json.users, mode))
        .then(embeds => formatPages(embeds, interaction, 'No leaders found!'))
        .catch(error => {
            console.log(`Error in leaderboard(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.favoriteMode;
}

function formatLeaders(leaders, mode) {
    const ranks = rankLeaders(leaders);
    const url = 'https://playstrategy.org/api/users';
    const ids = leaders.map(leader => leader.id);
    return fetch(url, { method: 'post', body: ids.join(','), headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => {
            const players = rankPlayers(json, ranks).sort((a,b) => a.rank - b.rank);
            return chunk(players.map(formatPlayer), 6).map((fields, index) =>
                new EmbedBuilder()
                    .setColor(getColor(index))
                    .setThumbnail('https://assets.playstrategy.org/assets/logo/playstrategy-favicon-64.png')
                    .setTitle(`:trophy: ${title(mode)} Leaderboard`)
                    .setURL('https://playstrategy.org/player')
                    .addFields(fields)
                );
            }
        );
}

// Neither the leaderboard nor api/users return player ranks
function rankLeaders(leaders) {
    const ranks = {};
    var i = 0;
    for (leader of leaders)
        ranks[leader.id] = ++i;
    return ranks;
}

function rankPlayers(players, ranks) {
    for (player of players)
        player.rank = ranks[player.id];
    return players;
}

function formatPlayer(player) {
    const name = formatName(player);
    const badges = player.patron ? ' 🍺' : '';
    const profile = formatProfile(player.username, player.profile, player.playTime);
    return { name : `${name}${badges} #${player.rank}`, value: profile, inline: true };
}

function formatName(player) {
    var name = getLastName(player.profile) ?? player.username;
    if (player.title)
        name = `**${player.title}** ${name}`;
    const [country, rating] = getCountryAndRating(player.profile) || [];
    if (country && countryFlags.countryCode(country))
        name = `${countryFlags.countryCode(country).emoji} ${name}`;
    if (rating)
        name += ` (${rating})`;
    return name;
}

function getLastName(profile) {
    if (profile)
        return profile.lastName;
}

function getCountryAndRating(profile) {
    if (profile)
        return [profile.country, profile.fideRating];
}

function getColor(index, length) {
    const red = Math.min(Math.max(255 - index * 10, 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatProfile(username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://playstrategy.org/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/)).join(' ');
        if (bio)
            result.push(bio);
    }
    return result.join('\n');
}

function formatBio(bio) {
    const social = /:\/\/|\b(?:discord\.gg|github\.com|instagram\.com|twitch\.tv|twitter\.com|youtube\.com|youtu\.be)\b/i;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social) || bio[i].match(emailRegex)) {
            bio = bio.slice(0, i);
            break;
        }
        bio[i] = formatSiteLinks(bio[i]);
    }
    return bio;
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'), interaction);
}

module.exports = {process, interact};
