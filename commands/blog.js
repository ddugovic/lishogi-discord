const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const html2md = require('html-to-md');
const Parser = require('rss-parser');

function blog(author, interaction) {
    return new Parser().parseURL('https://lishogi.org/blog.atom')
        .then(feed => formatBlog(feed, interaction))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch(error => {
            console.log(`Error in blog(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBlog(blog, interaction) {
    const embeds = [];
    for (const entry of blog.items.values()) {
        const summary = formatEntry(entry);
        const red = Math.min(Math.max(summary.length - 150, 0), 255);
        var embed = new Discord.MessageEmbed()
            .setColor(formatColor(red, 0, 255-red))
            .setAuthor({name: entry.author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: getLink(entry.author)})
            .setTitle(entry.title)
            .setURL(entry.link)
            .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
            .setDescription(summary);
        const image = getImage(html2md(entry.content));
        if (image)
            embed = embed.setImage(image)
        embeds.push(embed);
    }
    return embeds;
}

function formatEntry(entry) {
    if (entry.contentSnippet.length < 200)
        return entry.contentSnippet;
    const snippet = entry.contentSnippet.split(/\r?\n/);
    var message = '';
    while (message.length < 80)
        message += `${snippet.shift()}\n`;
    return message.trim();
}

function getLink(author) {
    const match = author.match(/@(\w+)/)
    if (match)
        return `https://lishogi.org/@/${match[1]}`;
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
