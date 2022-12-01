const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const { parseFeed, formatContent, getAuthorName, getContent, getImageURL, getURL } = require('../lib/parse-feed');

function blog(user, interaction) {
    const url = 'https://playstrategy.org/blog.atom';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => feed.entry.map(formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((timestamp - now) / (3600 * 24)), 0), 255);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 80)}`);
    const authorName = getAuthorName(entry);
    if (authorName)
        embed = embed.setAuthor({ name: authorName, iconURL: 'https://playstrategy.org/assets/images/favicon-32-black.png', url: getUserLink(authorName) });
    const image = getImageURL(entry);
    if (image)
        embed = embed.setImage(image);
    return embed;
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return blog(interaction.user, interaction);
}

module.exports = {process, interact};
