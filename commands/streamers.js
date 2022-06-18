const axios = require('axios');
const countryFlags = require('emoji-flags');
const Discord = require('discord.js');
const formatSeconds = require('../lib/format-seconds');

async function streamers(author) {
    return axios.get('https://lichess.org/streamer/live')
        .then(response => setStreamers(response.data))
        .catch((error) => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setStreamers(data) {
    if (data.length) {
        const url = 'https://lichess.org/api/users';
        const ids = data.map(streamer => streamer.id);
        return axios.post(url, ids.join(','), { headers: { Accept: 'application/json' } })
            .then(response => {
                const embed = new Discord.MessageEmbed()
                    .setColor(0xFFFFFF)
                    .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
                    .setTitle(`:satellite: Lichess Streamers`)
                    .setURL('https://lichess.org/streamer')
                    .addFields(response.data.map(formatStreamer))
                return { embeds: [ embed ] };
        });
    } else {
        return 'No streamers are currently live.';
    }
}

function formatStreamer(streamer) {
    const name = formatName(streamer);
    const badges = streamer.patron ? '🦄' : '';
    return { name : `${name} ${badges}`, value: formatProfile(streamer.username, streamer.profile, streamer.playTime), inline: true };
}

function formatName(streamer) {
    var name = getLastName(streamer.profile) ?? streamer.username;
    if (streamer.title)
        name = `**${streamer.title}** ${name}`;
    const country = getCountry(streamer.profile);
    if (country && countryFlags.countryCode(country))
        name = `${countryFlags.countryCode(country).emoji} ${name}`;
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

function formatProfile(username, profile, playTime) {
    const links = profile ? (profile.links ?? profile.bio) : '';
    const duration = formatSeconds.formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    var result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}\n[Profile](https://lichess.org/@/${username})`];
    if (links) {
        for (link of getTwitch(links))
            result.push(`[Twitch](https://${link})`);
        for (link of getYouTube(links))
            result.push(`[YouTube](https://${link})`);
    }
    if (profile && profile.bio) {
        const social = /:\/|:$|twitch\.tv|youtube\.com/i;
        var bio = profile.bio.split(/\s+/);
        for (let i = 0; i < bio.length; i++) {
            if (bio[i].match(social)) {
                bio = bio.slice(0, i);
                break;
            }
        }
        if (bio.length)
            result.push(bio.join(' '));
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

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
