const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatPages } = require('../lib/format-pages');
const { parseFeed, formatContent } = require('../lib/parse-feed');

function fesa(author, interaction) {
    const url = 'http://fesashogi.eu/fesa.rss';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/atom+xml' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseFeed(text))
        .then(feed => feed.channel.item.map(entry => formatEntry(entry, feed.channel)))
        .then(embeds => formatPages('Article', embeds, interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in fesa(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatEntry(entry, channel) {
    const timestamp = Math.floor(new Date(entry.pubDate).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const blue = Math.min(Math.max(Math.round((now - timestamp) / (3600 * 24)), 0), 255);
    return new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setAuthor({name: channel.title, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: channel.link})
        .setTitle(entry.title)
        .setURL(entry.link)
        .setDescription(`<t:${timestamp}:F>\n${formatContent(entry.description, 200)}`);
}

function process(bot, msg) {
    fesa(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return fesa(interaction.user, interaction);
}

module.exports = {process, interact};
