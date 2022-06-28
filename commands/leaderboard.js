const axios = require('axios');
const User = require('../models/User');

async function leaderboard(author, mode) {
    var favoriteMode = mode;
    if (!mode) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.chessName) {
            return 'You need to set your chess.com username with setuser!';
        }
        favoriteMode = user.favoriteMode;
    }
    const url = 'https://api.chess.com/pub/leaderboards';
    return axios.get(url)
        .then(response => formatLeaderboard(response.data, favoriteMode))
        .catch((err) => {
            console.log(`Error in leaderboard(${author.username}): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatLeaderboard(data, mode) {
    if (mode && data[mode]) {
        return data[mode][0].url;
    } else {
        return data['live_blitz'][0].url;
    }
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

function formatProfile(username, profile, playTime) {
    const links = profile ? (profile.links ?? profile.bio) : '';
    const tv = playTime ? playTime.tv : 0;
    const duration = formatSeconds(tv).split(', ')[0];
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://chess.com/@/${username})`];
    if (links) {
        for (link of getTwitch(links))
            result.push(`[Twitch](https://${link})`);
        for (link of getYouTube(links))
            result.push(`[YouTube](https://${link})`);
    }
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if (bio.length)
            result.push(bio);
    }
    return result.join('\n');
}

function getTwitch(links) {
    const pattern = /twitch.tv\/\w{4,25}/g;
    return links.matchAll(pattern);
}

function getYouTube(links) {
    // https://stackoverflow.com/a/65726047
    const pattern = /youtube\.com\/(?:channel\/UC[\w-]{21}[AQgw]|(?:c\/|user\/)?[\w-]+)/g
    return links.matchAll(pattern);
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

async function reply(interaction) {
    return leaderboard(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
