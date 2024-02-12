const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatChunks, formatError } = require('../lib/format-pages');
const html2md = require('html-to-md');
const { parseFeed, formatContent, getContent, getURL } = require('../lib/parse-feed');

function wiki(author, interaction) {
    const url = 'http://wiki.shogiharbour.com/api.php?urlversion=1&days=30&limit=50&action=feedrecentchanges&feedformat=atom';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => formatFeed(feed))
        .then(embeds => formatChunks(embeds, interaction, 'No recent edit found!'))
        .catch(error => {
            console.log(`Error in wiki(${author.username}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
        });
}

function formatFeed(feed) {
    const embeds = [];
    for (const entry of feed.entry)
        embeds.push(formatEntry(entry));
    return embeds;
}

function formatEntry(entry) {
    const timestamp = Math.floor(new Date(entry.updated).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const red = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    const content = getContent(entry.summary);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setTitle(entry.title)
        .setURL(getURL(entry))
        .setDescription(`<t:${timestamp}:F>\n${formatContent(content, 200)}`);
    const image = getImage(html2md(content));
    if (image)
        embed = embed.setThumbnail(image);
    return embed;
}

function getImage(content) {
    const match = content.match(/!\[.*?\]\((\S+)\)/)
    if (match)
        return match[1];
}

function process(bot, msg) {
    wiki(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    wiki(interaction.user, interaction);
}

module.exports = {process, interact};
