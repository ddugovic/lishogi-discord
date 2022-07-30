const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { parseFeed, formatContent } = require('../lib/parse-feed');

function news(author, interaction) {
    const url = 'http://www.thechessmind.net/blog/rss.xml';
    return axios.get(url, { headers: { Accept: 'application/rss+xml' } })
        .then(response => parseFeed(response.data))
        .then(feed => formatEntries(feed))
        .then(embeds => formatPages(embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatEntries(feed) {
    const embeds = [];
    for (const entry of feed.channel.item.values()) {
        const timestamp = Math.floor(new Date(entry.pubDate).getTime() / 1000);
        const summary = formatContent(entry.description, 120).replace(/published here/, `published [here](https://thechessmind.substack.com/)`);
        const red = Math.min(Math.max(summary.length - 150, 0), 255);
        var embed = new EmbedBuilder()
            .setColor(formatColor(red, 0, 255-red))
            .setAuthor({name: entry['dc:creator'], iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', link: feed.link})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setDescription(`<t:${timestamp}:F>\n${summary}`);
        if (entry.categories)
            embed = embed.addFields({ name: 'Categories', value: entry.categories.map(category => `[${category}](http://www.thechessmind.net/blog/tag/${link(category)})`).join(', ') });
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
