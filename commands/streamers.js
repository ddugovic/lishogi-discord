const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const { formatTitledUserLink, formatUserLink, formatUserLinks } = require('../lib/format-user-links');

async function streamers(author) {
    return axios.get('https://lichess.org/streamer/live')
        .then(response => setStreamers(response.data))
        .catch(error => {
            console.log(`Error in streamers(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setStreamers(streamers) {
    if (streamers.length) {
        const fields = streamers.map(formatStreamer);
        const rating = Math.max(...fields.map(field => field.rating));
        const embed = new Discord.MessageEmbed()
            .setColor(getColor(rating))
            .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
            .setTitle(`:satellite: Lichess Streamers`)
            .setURL('https://lichess.org/streamer')
            .addFields(fields.sort((a,b) => b.score - a.score));
        return { embeds: [ embed ] };
    } else {
        return 'No streamers are currently live.';
    }
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatStreamer(streamer) {
    const name = streamer.title ? `**${streamer.title}** ${streamer.name}` : streamer.name;
    const badges = streamer.patron ? '🦄' : '';
    const [profile, rating, score] = formatStream(streamer.username, streamer.title, streamer.streamer, streamer.stream);
    return { name : `${name} ${badges}`, value: profile, inline: true, 'rating': rating, 'score': score };
}

function formatStream(username, title, streamer, stream) {
    const links = [`[Profile](https://lichess.org/@/${username})`];
    if (streamer.twitch)
        links.push(formatSocialLinks(streamer.twitch));
    if (streamer.youTube)
        links.push(formatSocialLinks(streamer.youTube));

    const result = [stream.status, links.join(' | ')];
    var length = 0;
    var rating = 0;
    if (streamer.headline && streamer.description) {
        const text = `*${streamer.headline}*\n${formatDescription(streamer.description.split(/\s+/))}`;
        if ((length = text.length)) {
            rating = title == 'GM' ? 2500 : title == 'IM' ? 2400 : title == 'FM' ? 2300 : title ? 2200 : 1000;
            result.push(text);
	}
    }
    return [result.join('\n'), rating, (length + rating) * 1000000];
}

function formatDescription(text) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(social)) {
            text = text.slice(0, i);
            break;
        }
        text[i] = formatUserLinks(text[i]);
    }
    return text.join(' ');
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return streamers(interaction.user);
}

module.exports = {process, reply};
