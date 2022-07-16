const ChessWebAPI = require('chess-web-api');
const countryFlags = require('emoji-flags');
const formatLinks = require('../lib/format-links');
const formatSeconds = require('../lib/format-seconds');

async function streamers(author) {
    return new ChessWebAPI().getStreamers()
        .then(response => formatStreamers(filterStreamers(response.body.streamers)) || 'No streamers are currently live.')
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function filterStreamers(streamers) {
    return streamers.filter(streamer => streamer.is_live);
}

function formatStreamers(streamers) {
    return streamers.map(streamer => `<${streamer.twitch_url}>`).join('\n');
}

function formatName(streamer) {
    var name = getLastName(streamer.profile) ?? streamer.username;
    if (streamer.title)
        name = `**${streamer.title}** ${name}`;
    const country = getCountry(streamer.profile);
    if (country && countryFlags.countryCode(country))
        name = `${countryFlags.countryCode(country).emoji} ${name}`;
    const rating = getRating(streamer.profile);
    if (rating)
        name += ` (${rating})`;
    return name;
}

function getCountry(profile) {
    if (profile)
        return profile.country;
}

function getLastName(profile) {
    if (profile)
        return profile.lastName;
}

function getRating(profile) {
    if (profile)
        return profile.fesaRating;
}

function formatProfile(username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://chess.com/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var length = 0;
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if ((length = bio.length)) {
            rating = getRating(profile) ?? 1000;
            result.push(bio);
	}
    }
    return [((length + rating) * 1000000 + playTime.tv * 1000 + playTime.total), result.join('\n')];
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

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
