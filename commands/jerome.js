const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const formatPages = require('../lib/format-pages');
const { parseFeed, formatContent, getAuthorName, getContent, getSummary, getTitle, getThumbnailURL, getURL } = require('../lib/parse-feed');

function jerome(author, interaction) {
    const url = 'https://jeromegambit.blogspot.com/feeds/posts/default?max-results=100';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' }, params: { 'max-results': 100 } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => formatFeed(feed))
        .then(embeds => formatPages(embeds, interaction, 'No jerome found!'))
        .catch(error => {
            console.log(`Error in jerome(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatFeed(feed) {
    const embeds = [];
    const authorURL = feed.link[0]['$'].href;
    for (const entry of feed.entry.values())
        embeds.push(formatEntry(entry, authorURL));
    return embeds;
}

function formatEntry(entry, authorURL) {
    const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const authorName = getAuthorName(entry);
    const summary = getSummary(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: authorName, iconURL: 'https://4.bp.blogspot.com/-83OMP-ryCNc/YDwRRkljBsI/AAAAAAAAuNE/3-yw5zUnXyIoArTU21KCxixTYcXz5E91QCK4BGAYYCw/s80/IMG_20210223_0001.jpg', url: authorURL})
        .setDescription(`<t:${timestamp}:F>\n${formatContent(summary, 200)}`);
    const title = getTitle(entry);
    if (title)
        embed = embed.setTitle(getTitle(entry))
    const url = getURL(entry);
    if (url)
        embed = embed.setURL(url);
    const image = getThumbnailURL(entry)
    if (image)
        embed = embed.setThumbnail(image);
    return embed;
}

function process(bot, msg) {
    jerome(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    jerome(interaction.user, interaction);
}

module.exports = {process, interact};
