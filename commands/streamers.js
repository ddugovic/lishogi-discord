const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const formatFlair = require('../lib/format-flair');
const formatLang = require('../lib/format-lang');
const { formatStreamerLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');

function streamers(author, interaction) {
    const url = 'https://lichess.org/api/streamer/live';
    let status, statusText;
    return fetch(url)
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setStreamers(json))
        .then(embeds => formatPages(embeds, interaction, 'No streamers are currently live.'))
        .catch(error => {
            console.log(`Error in streamers(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
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
    const lang = formatStreamLang(streamer.stream) ?? '';
    const name = streamer.title ? `${streamer.title} ${streamer.name}` : streamer.name;
    const flair = formatStreamerFlair(streamer) ?? '';
    const badges = streamer.patron ? ' 🪽' : '';
    const [profile, rating, score] = formatStream(streamer.name, streamer.title, streamer.streamer, streamer.stream);
    return { name : `${lang}${name}${flair}${badges}`, value: profile, inline: true, 'rating': rating, 'score': score };
}

function formatStreamerFlair(streamer) {
    const flair = streamer.flair ? formatFlair(streamer.flair) : null;
    if (flair)
        return `${flair} `;
}

function formatStreamLang(stream) {
    // ASSUME until language emojis exist (or API provides flags), language == flag
    const flagName = stream.lang ? formatLang(stream.lang.toUpperCase()) : null;
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
