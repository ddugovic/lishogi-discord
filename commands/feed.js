const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const formatPages = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const { parseFeed, formatContent, getAuthorName, getContent, getThumbnailURL, getURL } = require('../lib/parse-feed');

function feed(author, interaction) {
    const url = 'https://lichess.org/feed.atom';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => feed.entry.map(formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in feed(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({ name: 'Lichess', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png' })
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 80)}`);
    const image = getThumbnailURL(entry);
    if (image)
        embed = embed.setImage(image);
    return embed;
}

function process(bot, msg) {
    feed(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return feed(interaction.user, interaction);
}

module.exports = {process, interact};
