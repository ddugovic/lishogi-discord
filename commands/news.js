const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatPages } = require('../lib/format-pages');
const { parseFeed, formatContent } = require('../lib/parse-feed');
const Parser = require('rss-parser');

function news(author, interaction) {
    const url = 'https://thechessmind.substack.com/feed';
    return new Parser().parseURL(url)
        .then(feed => feed.items.map(formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): ${error}`);
            return `An error occurred handling your request: ${url} failed to respond`;
        });
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.isoDate).getTime() / 1000);
    const summary = entry.contentSnippet;
    const red = Math.min(Math.max(summary.length, 0), 255);
    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: entry.creator, iconURL: 'https://substackcdn.com/image/fetch/w_40,h_40,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0493e037-cdcb-4922-9580-75f5bd13d40c_144x144.png', url: 'https://thechessmind.substack.com/'})
        .setTitle(entry.title)
        .setURL(entry.link)
        .setDescription(`<t:${timestamp}:F>\n${summary}`);
}

function link(str) {
    return str.toLowerCase().replaceAll(/\s+/g, '-');
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return news(interaction.user, interaction);
}

module.exports = {process, interact};
