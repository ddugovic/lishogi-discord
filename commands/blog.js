const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatError, formatPages } = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const { parseFeed, formatContent, getAuthorName, getContent, getImageURL, getURL } = require('../lib/parse-feed');

function blog(author, interaction) {
    const url = 'https://lishogi.org/blog.atom';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => feed.entry.map(formatEntry))
        .then(embeds => formatPages('Entry', embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${author.username}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const authorName = getAuthorName(entry);
    const content = getContent(entry);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({ name: authorName, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: getUserLink(authorName) })
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 80)}`);
    const image = getImageURL(entry);
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
