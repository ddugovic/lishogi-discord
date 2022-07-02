const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatTitledUserLink, formatUserLink, formatUserLinks } = require('../lib/format-user-links');
const formatSeconds = require('../lib/format-seconds');

async function streamers(author) {
    return axios.get('https://lishogi.org/streamer/live')
        .then(response => setStreamers(response.data))
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setStreamers(streamers) {
    if (streamers.length) {
        const url = 'https://lishogi.org/api/users';
        const ids = streamers.map(streamer => streamer.id);
        return axios.post(url, ids.join(','), { headers: { Accept: 'application/json' } })
            .then(response => {
                const embed = new Discord.MessageEmbed()
                    .setColor(0xFFFFFF)
                    .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
                    .setTitle(`:satellite: Lishogi Streamers`)
                    .setURL('https://lishogi.org/streamer')
                    .addFields(response.data.map(formatStreamer).sort((a,b) => b.score - a.score));
                return { embeds: [ embed ] };
        });
    } else {
        return 'No streamers are currently live.';
    }
}

function formatStreamer(streamer) {
    const name = formatName(streamer);
    const badges = streamer.patron ? '⛩️' : '';
    const [score, profile] = formatProfile(streamer.username, streamer.profile, streamer.playTime);
    return { name : `${name} ${badges}`, value: profile, inline: true, 'score': score };
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
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://lishogi.org/@/${username})`);

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
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio = bio.slice(0, i);
            break;
        }
        bio[i] = formatUserLinks(bio[i]);
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
