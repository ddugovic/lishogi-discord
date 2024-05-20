const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatLang = require('../lib/format-lang');
const { formatStreamerLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');

function streamers(author, interaction) {
    let status, statusText;
    return fetch('https://lichess.org/api/streamer/live')
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setStreamers(json))
        .then(embeds => formatPages(embeds, interaction, 'No streamers are currently live.'))
        .catch(error => {
            console.log(`Error in streamers(${author.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function setStreamers(streamers) {
    streamers = streamers.map(formatStreamer).sort((a,b) => b.score - a.score);
    return chunk(streamers, 6).map(fields => {
        const rating = Math.max(...fields.map(field => field.rating));
        return new EmbedBuilder()
            .setColor(getColor(rating))
            .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
            .setTitle(`:satellite: Lichess Streamers`)
            .setURL('https://lichess.org/streamer')
            .addFields(fields);
    });
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatStreamer(streamer) {
    const lang = formatFlair(streamer.stream.lang) ?? '';
    const name = streamer.title ? `${streamer.title} ${streamer.name}` : streamer.name;
    const badges = streamer.patron ? ' 🦄' : '';
    const [profile, rating, score] = formatStream(streamer.name, streamer.title, streamer.streamer, streamer.stream);
    return { name : `${lang}${name}${badges}`, value: profile, inline: true, 'rating': rating, 'score': score };
}

function formatFlair(lang) {
    // ASSUME until language emojis exist (or API provides flags), language == flag
    // Future work: map some flairs to discord emojis
    const flagName = lang ? formatLang(lang.toUpperCase()) : null;
    if (flagName)
        return `${flagName} `;
}

function formatStream(username, title, streamer, stream) {
    const links = formatStreamerLinks(streamer.twitch, streamer.youTube);
    if (stream.service == 'youTube') {
        links.reverse();
    }
    const result = [stream.status.replaceAll(/\[[A-Z]{2}\]/g, '').replaceAll(/(?<!https?:\/\/)(?:www\.)?lichess\.org/gi, ':horse:').replaceAll(/\|?(?: \!\w+)+/g, ''), `:satellite: ${links.join(' | ')}`];
    var length = 0;
    var rating = 0;
    if (streamer.headline && streamer.description) {
        const text = `*${streamer.headline.replaceAll(/\[[A-Z]{2}\]/g, '').replaceAll(/(?<!https?:\/\/)(?:www\.)?lichess\.org/gi, ':horse:')}*`;
        if ((length = text.length)) {
            rating = title == 'GM' ? 2500 : title == 'IM' ? 2400 : title == 'FM' ? 2300 : title ? 2200 : 2000;
            result.push(text);
	}
    }
    return [`${result.join('\n')}`, rating, length + rating];
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
    streamers(interaction.user, interaction);
}

module.exports = {process, interact};
