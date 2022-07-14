const { MessageEmbed } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const getUserLink = require('../lib/get-site-links');
const html2md = require('html-to-md');
const Parser = require('rss-parser');

function blog(author, interaction) {
    return new Parser().parseURL('https://lichess.org/blog.atom')
        .then(feed => Array.from(feed.items.values(), formatEntry))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatEntry(entry) {
    const timeago = new Date().getTime() - new Date(entry.isoDate).getTime();
    const red = Math.min(Math.max(Math.round(timeago / (1000 * 3600 * 24), 0), 255));
    var embed = new MessageEmbed()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({ name: entry.author, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getUserLink(entry.author) })
        .setTitle(entry.title)
        .setURL(entry.link)
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(formatSnippet(entry));
    const image = getImage(html2md(entry.content));
    if (image)
        embed = embed.setImage(image)
    return embed;
}

function formatSnippet(entry) {
    if (entry.contentSnippet.length < 200)
        return entry.contentSnippet;
    const snippet = entry.contentSnippet.split(/\r?\n/);
    var message = '';
    while (message.length < 80)
        message += `${snippet.shift()}\n`;
    return message.trim();
}

function getImage(content) {
    const match = content.match(/!\[\]\((\S+)\)/)
    if (match)
        return match[1];
}

function process(bot, msg) {
    blog(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return blog(interaction.user, interaction);
}

module.exports = {process, interact};
