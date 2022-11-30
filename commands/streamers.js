const { EmbedBuilder } = require('discord.js');
const flags = require('emoji-flags');
const formatColor = require('../lib/format-color');
const { formatSocialLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');
const {  formatUserLinks } = require('../lib/format-site-links');
const formatSeconds = require('../lib/format-seconds');

function streamers(user, interaction) {
    let status, statusText;
    return fetch('https://lidraughts.org/streamer/live', { headers: { Accept: 'application/json' } })
	.then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setStreamers(json))
        .then(embeds => formatPages(embeds, interaction, 'No streamers are currently live.'))
        .catch(error => {
            console.log(`Error in streamers(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function setStreamers(streamers) {
    if (streamers.length) {
        const url = 'https://lidraughts.org/api/users';
        const ids = streamers.map(streamer => streamer.id);
        return fetch(url, { method: 'post', body: ids.join(','), headers: { Accept: 'application/json' } })
	    .then(response => response.json())
            .then(json => chunk(json.map(formatStreamer).sort((a,b) => b.score - a.score), 6).map(fields => {
                return new EmbedBuilder()
                    .setColor(getColor(Math.max(...fields.map(field => field.rating))))
                    .setThumbnail('https://lidraughts.org/assets/favicon.64.png')
                    .setTitle(`:satellite: Lidraughts Streamers`)
                    .setURL('https://lidraughts.org/streamer')
                    .addFields(fields);
            }));
    }
    return streamers;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatStreamer(streamer) {
    const [country, fmjdRating] = getCountryAndRating(streamer.profile) ?? [];
    const name = formatName(streamer, country, fmjdRating);
    const badges = data.patron ? '⛃' : '';
    const [profile, rating, score] = formatProfile(streamer.username, streamer.profile, fmjdRating, streamer.playTime);
    return { name : `${name} ${badges}`, value: profile, inline: true, 'rating': rating, 'score': score };
}

function getCountryAndRating(profile) {
    if (profile)
        return [profile.country, profile.fmjdRating];
}

function formatName(streamer, country, rating) {
    var name = getLastName(streamer.profile) ?? streamer.username;
    if (streamer.title)
        name = `**${streamer.title}** ${name}`;
    if (country && flags.countryCode(country))
        name = `${flags.countryCode(country).emoji} ${name}`;
    if (rating)
        name += ` (${rating})`;
    return name;
}

function getLastName(profile) {
    if (profile)
        return profile.lastName;
}

function formatProfile(username, profile, fmjdRating, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lidraughts.org/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var length = 0;
    var rating = 0;
    if (profile && profile.bio) {
        const bio = formatBio(profile.bio.split(/\s+/));
        if ((length = bio.length)) {
            rating = fmjdRating ?? 1000;
            result.push(bio);
	}
    }
    return [result.join('\n'), rating, ((length + rating) * 1000000 + playTime.tv * 1000 + playTime.total)];
}

function formatBio(bio) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        bio[i] = formatUserLinks(bio[i]);
    }
    return bio.join(' ');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return streamers(interaction.user, interaction);
}

module.exports = {process, interact};
