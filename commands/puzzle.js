const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');

function puzzle(author) {
    const url = 'https://lichess.org/api/puzzle/daily';
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatPuzzle(json.game, json.puzzle))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in puzzle(${author.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatPuzzle(game, puzzle) {
    const players = game.players.map(formatPlayer).join(' - ');
    return new EmbedBuilder()
        .setColor(getColor(puzzle.rating))
        .setAuthor({ name: players, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/${game.id}` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`:jigsaw: Daily Puzzle #${puzzle.id}`)
        .setURL(`https://lichess.org/training/${puzzle.id}`)
        .addFields([
            { name: 'Attempts', value: `**${puzzle.plays}**`, inline: true },
            { name: 'Themes', value: puzzle.themes.map(formatTheme).join(', '), inline: true }
	])
        .setImage(`https://lichess1.org/training/export/gif/thumbnail/${puzzle.id}.gif`);
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    if (player.title)
        return `${player.title} ${player.name.split(' ')[0]}`;
    return player.name;
}

function formatTheme(theme) {
    return `[${title(theme)}](https://lichess.org/training/${theme})`;
}

function title(str) {
    str = str.replace(/([a-z])([A-Z1-9])/g, '$1 $2');
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

function process(bot, msg, mode) {
    puzzle(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.editReply(await puzzle(interaction.user));
}

module.exports = {process, interact};
