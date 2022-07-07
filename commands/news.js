const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const Parser = require('rss-parser');

function news(author, interaction) {
    return new Parser().parseURL('http://www.thechessmind.net/blog/rss.xml')
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
    for (const entry of feed.items.values()) {
        const summary = formatSummary(trimSummary(entry.contentSnippet));
        const red = Math.min(Math.max(summary.length - 150, 0), 255);
        var embed = new Discord.MessageEmbed()
            .setColor(formatColor(red, 0, 255-red))
            .setAuthor({name: entry.creator, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', link: feed.link})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setDescription(summary);
        if (entry.categories)
            embed = embed.addField('Categories', entry.categories.map(category => `[${category}](http://www.thechessmind.net/blog/tag/${link(category)})`).join(', '));
        embeds.push(embed);
    }
    return embeds;
}

function trimSummary(snippet) {
    if (snippet.length < 200)
        return snippet;
    const lines = snippet.split(/\r?\n/);
    var message = '';
    while (message.length < 80)
        message += `${lines.shift()}\n`;
    return message.trim();
}

function formatSummary(snippet) {
    return trimSummary(snippet).replace(/published here/, `published [here](https://thechessmind.substack.com/)`);
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
