const { EmbedBuilder } = require('discord.js');
const formatError = require('../lib/format-error');
const { formatChunks } = require('../lib/format-pages');
const html2md = require('html-to-md');

function coach(author, interaction) {
    const url = 'https://lishogi.org/coach';
    let status, statusText;
    return fetch(url)
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => formatCoaches(text))
        .then(embeds => formatChunks(embeds, interaction, 'No coach found!'))
        .catch(error => {
            console.log(`Error in coach(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatCoaches(document) {
    const embeds = [];
    const pattern = /!\[.+\]\((.+)\)(?:\r?\n)+## (.+)(?:\r?\n)+(.*)(?:\r?\n)+\|\|\r?\n\|(?:-+\|)+((?:\r?\n\|(?:.+\|)+)+)\r?\n\|Active\|/g
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatCoach(match[1], match[2], match[3], match[4]));
    return embeds.length ? { embeds: embeds.slice(0, 3) } : embeds;
}

function formatCoach(image, name, description, details) {
    return new EmbedBuilder()
        .setAuthor({name: 'Lishogi Coach', iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: 'https://lishogi.org/coach/'})
        .setTitle(name)
        .setURL(getLink(details))
        .setThumbnail(image)
        .setDescription(description);
}

function getLink(coach) {
    const match = coach.match(/\(\/@\/(\w+)\)\|/);
    if (match)
        return `https://lishogi.org/coach/${match[1]}`;
}

function process(bot, msg) {
    coach(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return coach(interaction.user, interaction);
}

module.exports = {process, interact};
