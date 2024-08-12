const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatPages } = require('../lib/format-pages');
const { formatContent } = require('../lib/parse-feed');
const Parser = require('rss-parser');

function jerome(author, interaction) {
    const url = 'https://jeromegambit.blogspot.com/feeds/posts/default?max-results=100';
    return new Parser().parseURL(url)
        .then(feed => feed.items.map(formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No jerome found!'))
        .catch(error => {
            console.log(`Error in jerome(${author.username}): ${error}`);
            return `An error occurred handling your request: ${url} failed to respond`;
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const authorName = entry.author;
    const summary = entry.summarySnippet;
    const red = Math.min(Math.max(summary.length, 0), 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: authorName, iconURL: 'https://4.bp.blogspot.com/-83OMP-ryCNc/YDwRRkljBsI/AAAAAAAAuNE/3-yw5zUnXyIoArTU21KCxixTYcXz5E91QCK4BGAYYCw/s80/IMG_20210223_0001.jpg', url: 'https://jeromegambit.blogspot.com/'})
        .setDescription(`<t:${timestamp}:F>\n${formatContent(summary, 200)}`);
    if (entry.title)
        embed = embed.setTitle(entry.title)
    const url = entry.link;
    if (url)
        embed = embed.setURL(url);
    return embed;
}

function process(bot, msg) {
    jerome(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    jerome(interaction.user, interaction);
}

module.exports = {process, interact};
