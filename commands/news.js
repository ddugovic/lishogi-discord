const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { parseFeed, formatContent } = require('../lib/parse-feed');

function news(author, interaction) {
    const url = 'https://thechessmind.substack.com/feed';
    return axios.get(url, { headers: { Accept: 'application/rss+xml' } })
        .then(response => parseFeed(response.data))
        .then(feed => formatEntries(feed.channel))
        .then(embeds => formatPages(embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatEntries(channel) {
    const embeds = [];
    for (const entry of channel.item.values()) {
        const timestamp = Math.floor(new Date(entry.pubDate).getTime() / 1000);
        const summary = formatContent(entry.description, 120);
        const red = Math.min(Math.max(summary.length - 150, 0), 255);
        var embed = new EmbedBuilder()
            .setColor(formatColor(red, 0, 255-red))
            .setAuthor({name: entry['dc:creator'], url: channel.link})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setDescription(`<t:${timestamp}:F>\n${summary}`);
        embeds.push(embed);
    }
    return embeds;
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
