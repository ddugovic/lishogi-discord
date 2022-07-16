const ChessWebAPI = require('chess-web-api');
const { MessageEmbed } = require('discord.js');
const formatPages = require('../lib/format-pages');

function titled(author, title, interaction) {
    return new ChessWebAPI().getTitledPlayers(title)
        .then(response => response.body.players.map(player => formatPlayer(player, title)))
        .then(embeds => formatPages(embeds, interaction, 'No titled players found!'))
        .catch(error => {
            console.log(`Error in titled(${author.username}, ${title}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatPlayer(player, title) {
    return new MessageEmbed().setTitle(`${title} ${player}`).setURL(`https://www.chess.com/member/${player}`).setDescription('Profile data not available.');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

function process(bot, msg, title) {
    titled(msg.author, title.toUpperCase()).then(message => msg.channel.send(message));
}

function interact(interaction) {
    titled(interaction.user, interaction.options.getString('title'), interaction);
}

module.exports = {process, interact};
