const axios = require('axios');
const Discord = require('discord.js');
const formatTable = require('../lib/format-table');
const html2md = require('html-to-md');

async function coach(author) {
    return axios.get('https://lichess.org/coach/en-US/all/login')
        .then(response => setCoach(response.data))
        .catch(error => {
            console.log(`Error in coach(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setCoach(document) {
    document = html2md(document);
    const pattern = /## (.*)(?:\r?\n)+(.*)(?:\r?\n)+\|\|\r?\n\|(?:-+\|)+((?:\r?\n\|(?:.+\|)+)+)\r?\n.*Active.*!\[.+\]\((.+)\)/;
    const match = document.match(pattern);
    if (match)
        return formatCoach(match[1], match[2], match[3].trim(), match[4]);
    return 'No coach found!';
}

function formatCoach(name, description, coach, image) {
    const embed = new Discord.MessageEmbed()
        .setAuthor({name: 'Lichess Coach', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: 'https://lichess.org/coach/'})
        .setTitle(name)
        .setURL(getLink(coach))
        .setThumbnail(image ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(description);
    return { embeds: [ embed ] };
}

function getLink(coach) {
    return `https://lichess.org/@/${coach.match(/\/@\/(\w+)/)[1]}`;
}

function process(bot, msg) {
    coach(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return coach(interaction.user);
}

module.exports = {process, reply};
