const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const formatPages = require('../lib/format-pages');
const { formatSiteLinks } = require('../lib/format-site-links');
const html2md = require('html-to-md');

function log(author, interaction) {
    return axios.get(`https://lichess.org/changelog`)
        .then(response => formatLog(response.data))
        .then(embeds => formatPages(embeds, interaction, 'No entries found!'))
        .catch((error) => {
            console.log(`Error in log(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatLog(document) {
    const embeds = [];
    const pattern = /(?<=^|\n)## (.+)\r?\n\r?\n((?:.+\r?\n)+)/g;
    for (match of html2md(document).matchAll(pattern))
        embeds.push(formatEntry(match[1], match[2]));
    return embeds;
}

function formatEntry(name, description) {
    return new MessageEmbed()
        .setTitle(name)
        .setURL('https://lichess.org/changelog')
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setDescription(formatSiteLinks(description));
}

function process(bot, msg) {
    log(msg.author).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return log(interaction.user, interaction);
}

module.exports = {process, interact};
