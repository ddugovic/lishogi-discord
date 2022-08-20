const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const html2md = require('html-to-md');

async function coach(author) {
    return axios.get('https://lishogi.org/coach')
        .then(response => setCoaches(response.data))
        .catch(error => {
            console.log(`Error in coach(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setCoaches(document) {
    const embeds = [];
    const pattern = /!\[.+\]\((.+)\)(?:\r?\n)+## (.+)(?:\r?\n)+(.*)(?:\r?\n)+\|\|\r?\n\|(?:-+\|)+((?:\r?\n\|(?:.+\|)+)+)\r?\n\|Active\|/g
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatCoach(match[1], match[2], match[3], match[4]));
    return embeds.length ? { embeds: embeds.slice(0, 3) } : 'No coach found!';
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

async function interact(interaction) {
    await interaction.deferReply();
    await interaction.editReply(await coach(interaction.user));
}

module.exports = {process, interact};
