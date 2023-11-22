const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatCountry = require('../lib/format-country');
const { formatSocialLinks } = require('../lib/format-links');
const { formatChunks, formatError } = require('../lib/format-pages');
const { formatSiteLinks } = require('../lib/format-site-links');

function streamers(author, interaction) {
    const url = 'https://lishogi.org/streamer/live';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setStreamers(json))
        .then(embeds => formatChunks(embeds, interaction, 'No streamers are currently live.'))
        .catch(error => {
            console.log(`Error in streamers(${author.username}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
        });
}

function setStreamers(streamers) {
    streamers = streamers.map(formatStreamer).sort((a,b) => b.score - a.score);
    return chunk(streamers, 6).map(fields => {
        const rating = Math.max(...fields.map(field => field.rating));
        return new EmbedBuilder()
            .setColor(getColor(rating))
            .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
            .setTitle(`:satellite: Lishogi Streamers`)
            .setURL('https://lishogi.org/streamer')
            .addFields(fields);
    });
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatStreamer(streamer) {
    const lang = formatLang(streamer.stream.lang) ?? '';
    const name = streamer.title ? `${streamer.title} ${streamer.name}` : streamer.name;
    const badges = streamer.patron ? '⛩️' : '';
    const [profile, rating, score] = formatStream(streamer.name, streamer.title, streamer.streamer, streamer.stream);
    return { name : `${lang}${name}${badges}`, value: profile, inline: true, 'rating': rating, 'score': score };
}

function formatLang(lang) {
    // ASSUME until language emojis exist (or API provides flags), language == country
    const countryName = lang ? formatCountry(lang.toUpperCase()) : null;
    if (countryName)
        return `${countryName} `;
}

function formatStream(username, title, streamer, stream) {
    const links = [`:satellite: [Stream](https://lishogi.org/streamer/${username})`];
    if (streamer.twitch)
        links.push(formatSocialLinks(streamer.twitch));
    if (streamer.youTube)
        links.push(formatSocialLinks(streamer.youTube));

    const result = [stream.status.replaceAll(/\[[A-Z]{2}\]/g, '').replaceAll(/(?<!https?:\/\/)(?:www\.)?lishogi\.org/gi, ':globe_with_meridians:').replaceAll(/\|?(?: \!\w+)+/g, ''), links.join(' | ')];
    var length = 0;
    var rating = 0;
    if (streamer.headline && streamer.description) {
        const text = `*${streamer.headline.replaceAll(/\[[A-Z]{2}\]/g, '').replaceAll(/(?<!https?:\/\/)(?:www\.)?lishogi\.org/gi, ':globe_with_meridians:')}*\n${formatDescription(streamer.description.split(/\s+/))}`;
        if ((length = text.length)) {
            rating = title == 'GM' ? 2500 : title == 'IM' ? 2400 : title == 'FM' ? 2300 : title ? 2200 : 2000;
            result.push(text);
	}
    }
    return [`${result.join('\n')}`, rating, length + rating];
}

function formatDescription(text) {
    const social = /:\/\/|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(social)) {
            text = text.slice(0, i);
            break;
        }
        text[i] = formatSiteLinks(text[i]);
    }
    return text.join(' ');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

function process(bot, msg, mode) {
    streamers(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    streamers(interaction.user, interaction);
}

module.exports = {process, interact};
