const axios = require('axios');
const Discord = require('discord.js');
const { formatSocialLinks } = require('../lib/format-links');
const formatSeconds = require('../lib/format-seconds');

async function streamers(author) {
    return axios.get('https://playstrategy.org/streamer/live')
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
        const embed = new Discord.MessageEmbed()
            .setColor(0xFFFFFF)
            .setThumbnail('https://assets.playstrategy.org/assets/logo/playstrategy-favicon-64.png')
            .setTitle(`:satellite: PlayStrategy Streamers`)
            .setURL('https://playstrategy.org/streamer')
            .addFields(formatStreamers(data));
        return { embeds: [ embed ] };
    } else {
        return 'No streamers are currently live.';
    }
}

function formatStreamers(data) {
    var streamers = [];
    for (streamer of data) {
        const name = formatName(streamer);
        const badges = data.patron ? '🍺' : '';
        streamers.push({ name : `${name} ${badges}`, value: `[Profile](https://playstrategy.org/@/${streamer.name})`, inline: true })
    }
    return streamers;
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
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const links = profile ? formatSocialLinks(profile.links ?? profile.bio ?? '') : [];
    links.unshift(`[Profile](https://playstrategy.org/@/${username})`);

    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    result.push(links.join(' | '));
    var length = 0;
    var rating = 0;
    if (profile && profile.bio) {
        const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
        const username = /@(\w+)/g;
        var bio = profile.bio.split(/\s+/);
        for (let i = 0; i < bio.length; i++) {
            if (bio[i].match(social)) {
                bio = bio.slice(0, i);
                break;
            }
            for (match of bio[i].matchAll(username)) {
                bio[i] = bio[i].replace(match[0], `[${match[0]}](https://playstrategy.org/@/${match[1]})`);
            }
        }
        if (bio.length)
            result.push(bio.join(' '));
    }
    return [((length + rating) * 1000000 + playTime.tv * 1000 + playTime.total), result.join('\n')];
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
