const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const { formatContent, getTopics } = require('../lib/parse-feed');
const Parser = require('rss-parser');

function community(author, username, interaction) {
    const url = username ? `https://lichess.org/@/${username}/blog.atom` : 'https://lichess.org/blog/community.atom';
    return new Parser().parseURL(url)
        .then(feed => feed.items.map(formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in community(${author.username}, ${username}): ${error}`);
            return `An error occurred handling your request: ${url} failed to respond`;
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const authorName = entry.author;
    const summary = entry.contentSnippet;
    const red = Math.min(Math.max(summary.length, 0), 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({ name: authorName, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getUserLink(authorName) })
        .setTitle(entry.title)
        .setURL(entry.link)
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(`<t:${timestamp}:F>\n${formatContent(summary, 80)}`);
    const topics = getTopics(entry);
    if (topics)
        embed = embed.addFields({ name: 'Topics', value: topics.map(topic => `[${topic.label}](${topic.scheme})`).join(', ') });
    return embed;
}

function process(bot, msg, username) {
    community(msg.author, username).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return community(interaction.user, interaction.options.getString('username'), interaction);
}

module.exports = {process, interact};
