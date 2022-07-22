const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');

function news(author, interaction) {
    const url = 'https://woogles.io/twirp/config_service.ConfigService/GetAnnouncements';
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, {}, {headers: context})
        .then(response => formatNews(response.data.announcements, interaction))
        .catch((error) => {
            console.log(`Error in news(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatNews(news, interaction) {
    const embeds = news.map(formatEntry);
    if (interaction)
        return formatPages(embeds, interaction);
    return { 'embeds': embeds.slice(0, 1) };
}

function formatEntry(entry) {
    const [description, imageURL] = formatBody(entry.body);
    const red = Math.min(Math.max(description.length - 150, 0), 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setTitle(entry.title)
        .setURL(formatURI(entry.link) ?? entry.link)
        .setDescription(description);
    if (imageURL)
        embed = embed.setThumbnail(imageURL)
            .setAuthor({name: 'Woogles', iconURL: 'https://woogles.io/logo192.png', url: 'https://woogles.io/'});
    else
        embed = embed.setThumbnail('https://woogles.io/logo192.png');
    return embed;
}

function formatBody(body) {
    body = body.split(/ +/).map(formatLink).join(' ');
    const pattern = /!\[[- \w]+\]\((.*)\)\s+([^]*)/;
    const match = body.match(pattern);
    if (match)
        return [match[2], match[1]];
    return [body, null];
}

function formatURI(link) {
    if (link.startsWith('/'))
        return `https://woogles.io${link}`;
}

function process(bot, msg) {
    news(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    news(interaction.user, interaction);
}

module.exports = {process, interact};
