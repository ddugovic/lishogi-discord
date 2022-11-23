const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const html2md = require('html-to-md');

function coach(author, interaction) {
    let status, statusText;
    return fetch('https://lichess.org/coach/en-US/all/login')
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => formatCoaches(text))
        .then(embeds => formatPages(embeds, interaction, 'No coach found!'))
        .catch(error => {
            console.log(`Error in coach(${author.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatCoaches(document) {
    const embeds = [];
    const pattern = /!\[.+\]\((.+)\)(?:\r?\n)+## (.+)(?:\r?\n)+(.*)(?:\r?\n)+\|\|\r?\n\|(?:-+\|)+((?:\r?\n\|(?:.+\|)+)+)\r?\n\|Active\|/g
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatCoach(match[1], match[2], match[3], match[4]));
    return embeds;
}

function formatCoach(image, name, description, details) {
    return new EmbedBuilder()
        .setColor(getColor(getRating(details) ?? 0))
        .setAuthor({name: 'Lichess Coach', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: 'https://lichess.org/coach/'})
        .setTitle(name)
        .setURL(getLink(details))
        .setThumbnail(image)
        .setDescription(description);
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function getRating(details) {
    const match = details.match(/\|Rating\|FIDE: (\d+)/);
    if (match)
        return match[1];
}

function getLink(details) {
    const match = details.match(/\(\/@\/(\w+)\)\|/);
    if (match)
        return `https://lichess.org/coach/${match[1]}`;
}

function process(bot, msg) {
    coach(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return coach(interaction.user, interaction);
}

module.exports = {process, interact};
