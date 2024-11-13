const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatPages } = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const { parseFeed, formatContent, getAuthors, getContent, getImageURL, getURL } = require('../lib/parse-feed');

function blog(author, interaction) {
    const url = 'https://blog.woogles.io/index.xml';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/rss+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => feed.channel.item.filter(entry => entry.title).map(formatEntry))
        .then(embeds => formatPages('Entry', embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${author.username}): ${error}`);
            return formatError(status, statusText)
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.pubDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const authors = getAuthors(entry);
    const authorNames = (authors instanceof Array ? authors.join(', ') : authors) ?? 'No Author';
    const authorURL = getUserLink(`@${authors instanceof Array ? authors.join(', ') : authors}`);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({ name: authorNames, iconURL: 'https://woogles.io/logo192.png', url: authorURL })
        .setTitle(entry.title ?? 'Untitled')
        .setURL(getURL(entry))
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 80)}`);
    const image = entry.image ?? getImageURL(entry);
    if (image)
        embed = embed.setImage(image);
    return embed;
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    return blog(interaction.user, interaction);
}

module.exports = {process, interact};
