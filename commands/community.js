const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const { parseFeed, formatContent, getAuthorName, getContent, getThumbnailURL, getTopics, getURL } = require('../lib/parse-feed');

function community(author, username, interaction) {
    const url = username ? `https://lichess.org/@/${username}/blog.atom` : 'https://lichess.org/blog/community.atom';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => feed.entry.map(formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in community(${author.username}, ${username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
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
        .setAuthor({ name: authorName, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getUserLink(authorName) })
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 80)}`);
    const topics = getTopics(entry);
    if (topics)
        embed = embed.addFields({ name: 'Topics', value: topics.map(topic => `[${topic.label}](${topic.scheme})`).join(', ') });
    const image = getThumbnailURL(entry);
    if (image)
        embed = embed.setImage(image);
    return embed;
}

function process(bot, msg, username) {
    community(msg.author, username).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return community(interaction.user, interaction.options.getString('username'), interaction);
}

module.exports = {process, interact};
