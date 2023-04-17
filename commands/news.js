const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatLink } = require('../lib/format-links');
const { formatPages } = require('../lib/format-pages');

function news(user, interaction) {
    const url = 'https://woogles.io/twirp/config_service.ConfigService/GetAnnouncements';
    const headers = { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'Woogles Statbot' };
    let status, statusText;
    return fetch(url, { method: 'POST', body: '{}', headers: headers })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatPages('News', json.announcements.map(formatEntry), interaction, 'No news found!'))
        .catch(error => {
            console.log(`Error in news(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
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

async function interact(interaction) {
    await interaction.deferReply();
    news(interaction.user, interaction);
}

module.exports = {process, interact};
