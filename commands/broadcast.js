const axios = require('axios');
const Discord = require('discord.js');

async function broadcast(author) {
    const url = 'https://lichess.org/api/broadcast?nb=1';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatBroadcast(response.data))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBroadcast(broadcast) {
    console.log(broadcast);
    if (broadcast.tour) {
        const embed = new Discord.MessageEmbed()
            .setTitle(broadcast.tour.name)
            .setURL(broadcast.tour.url)
            .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
            .setDescription(broadcast.tour.description);
        return { 'embeds': [ embed ] };
    } else {
        return 'No broadcast found!';
    }
}

function process(bot, msg) {
    broadcast(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return broadcast(interaction.user);
}

module.exports = {process, reply};
