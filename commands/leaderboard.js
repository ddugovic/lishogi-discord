const ChessWebAPI = require('chess-web-api');
const countryFlags = require('emoji-flags');
const { formatSocialLinks } = require('../lib/format-links');
const formatSeconds = require('../lib/format-seconds');
const User = require('../models/User');

async function leaderboard(author, mode) {
    var favoriteMode;
    if (!mode) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.chessName) {
            return 'You need to set your Chess.com username with setuser!';
        }
        favoriteMode = user.favoriteMode;
    }
    return new ChessWebAPI().getLeaderboards()
        .then(response => formatLeaderboard(response.body, mode ?? favoriteMode ?? 'live_blitz'))
        .catch((err) => {
            console.log(`Error in leaderboard(${author.username}, ${mode}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatLeaderboard(leaderboards, mode) {
    return leaderboards[mode] ? leaderboards[mode][0].url : leaderboards['live_blitz'][0].url;
}

function formatPlayer(player) {
    const name = formatName(player);
    const badges = player.flair_code == 'diamond_traditional' ? ':gem:' : '';
    const profile = formatProfile(player.username, player.profile, player.playTime);
    return { name : `${name} ${badges}`, value: profile, inline: true, perfs: player.perfs};
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

function formatProfile(username, profile, fideRating, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://chess.com/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if (bio.length)
            result.push(bio);
    }
    return result.join('\n');
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

function title(str) {
    return str.split('_')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

function process(bot, msg, mode) {
    leaderboard(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    interaction.editReply(await leaderboard(interaction.user, interaction.options.getString('mode')));
}

module.exports = {process, interact};
