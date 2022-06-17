const axios = require('axios');
const Discord = require('discord.js');
const parse = require('ndjson-parse');

async function bots(author) {
    return axios.get('https://lishogi.org/api/bot/online?nb=15', { headers: { Accept: 'application/x-ndjson' } })
        .then(response => setBots(filter(parse(response.data))))
        .catch((error) => {
            console.log(`Error in bots(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function filter(bots) {
    return bots.filter(bot => !bot.tosViolation);
}

function setBots(bots) {
    if (bots.length) {
        const embed = new Discord.MessageEmbed()
            .setColor(0xFFFFFF)
            .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
            .setTitle(`:robot: Lishogi Bots`)
            .setURL('https://lishogi.org/player/bots')
            .addFields(bots.map(formatBot));
        return { embeds: [ embed ] };
    } else {
        return 'No bots are currently online.';
    }
}

function formatBot(bot) {
    return { name : `${bot.username}`, value: `[Profile](https://lishogi.org/@/${bot.username})`, inline: true };
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return bots(interaction.user);
}

module.exports = {process, reply};
