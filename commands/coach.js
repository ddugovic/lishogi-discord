const axios = require('axios');
const Discord = require('discord.js');
const html2md = require('html-to-md');

async function coach(author) {
    return axios.get('https://lichess.org/coach/en-US/all/login')
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
    return new Discord.MessageEmbed()
        .setAuthor({name: 'Lichess Coach', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: 'https://lichess.org/coach/'})
        .setTitle(name)
        .setURL(getLink(details))
        .setThumbnail(image)
        .setDescription(description);
}

function getLink(coach) {
    const match = coach.match(/\(\/@\/(\w+)\)\|/);
    if (match)
        return `https://lichess.org/coach/${match[1]}`;
}

function process(bot, msg) {
    coach(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return coach(interaction.user);
}

module.exports = {process, reply};
