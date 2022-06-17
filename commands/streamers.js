const axios = require('axios');
const Discord = require('discord.js');
const countryFlags = require('emoji-flags');

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
    const links = getLinks(streamer.profile);
    return { name : `${name} ${badges}`, value: formatProfile(links, streamer), inline: true };
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

function getLinks(profile) {
    if (profile && profile.links)
        return profile.links.split('\r\n');
}

function formatProfile(links, streamer) {
    const pattern = /(?:twitch\.tv|youtube\.com)/;
    var result = [`[Profile](https://lichess.org/@/${streamer.username})`];
    if (links) {
        for (link of getTwitch(links))
            result.push(`[Twitch](${link})`);
        for (link of getYouTube(links))
            result.push(`[YouTube](${link})`);
    }
    if (streamer.profile && streamer.profile.bio) {
        const social = /@|:\/|:$|twitch\.tv|youtube\.com/i;
        var bio = streamer.profile.bio.split(/\s+/);
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
    const pattern = /^https?:\/\/(?:www\.)?twitch.tv\/[\w_]{4,25}$/;
    return links.filter(link => link.match(pattern));
}

function getYouTube(links) {
    // https://stackoverflow.com/a/65726047
    const pattern = /^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{21}[AQgw]|(c\/|user\/)?[\w-]+)$/
    return links.filter(link => link.match(pattern));
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
