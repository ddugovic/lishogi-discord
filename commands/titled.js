const ChessWebAPI = require('chess-web-api');
const { EmbedBuilder } = require('discord.js');
const formatPages = require('../lib/format-pages');
const plural = require('plural');
const shuffle = require('fisher-yates/inplace');

function titled(author, title, interaction) {
    return new ChessWebAPI().getTitledPlayers(title)
        .then(response => formatTitledPlayers(title, response.body.players))
        .then(embeds => formatPages(embeds, interaction, 'No titled players found!'))
        .catch(error => {
            console.log(`Error in titled(${author.username}, ${title}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatTitledPlayers(title, players) {
    return chunk(shuffle(players), 15).map(fields => {
        return new EmbedBuilder()
            .setTitle(plural(formatTitle(title), players.length))
            .addFields(fields.map(player => formatPlayer(player, title)));
    });
}

function formatTitle(title) {
    if (title.startsWith('W'))
        return "Women's " + formatTitle(title.slice(1));
    return title == 'GM' ? 'Grandmaster' :
        title == 'IM' ? 'International Master' :
        title == 'FM' ? 'FIDE Master' :
        title == 'NM' ? 'National Master' : 'Candidate Master';
}

function formatPlayer(player, title) {
    return { name: `${title} ${player}`, value: `[Profile](https://www.chess.com/member/${player})`, inline: true };
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
