const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { checkLink } = require('../lib/format-links');
const { formatChunks } = require('../lib/format-pages');

function puzzle(author, interaction) {
    const url = 'https://lishogi.org/api/puzzle/daily';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatPuzzle(json.game, json.puzzle))
        .then(embed => formatChunks([embed], interaction, 'No puzzle found!'))
        .catch(error => {
            console.log(`Error in puzzle(${author.username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatPuzzle(game, puzzle) {
    return new EmbedBuilder()
        .setColor(getColor(puzzle.rating))
        .setAuthor({ name: game.author, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: getLink(game.author) })
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(`:jigsaw: Daily Puzzle #${puzzle.id}`)
        .setURL(`https://lishogi.org/training/${puzzle.id}`)
        .addFields([
            { name: 'Attempts', value: `**${puzzle.plays}**`, inline: true },
            { name: 'Themes', value: puzzle.themes.map(formatTheme).join(', '), inline: true }
	])
        .setImage(`https://lishogi1.org/training/export/gif/thumbnail/${puzzle.id}.gif`);
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function getLink(text) {
    if (checkLink(text))
        return text;
}

function formatTheme(theme) {
    return `[${title(theme)}](https://lishogi.org/training/${theme})`;
}

function title(str) {
    str = str.replace(/([a-z])([A-Z1-9])/g, '$1 $2');
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

function process(bot, msg, mode) {
    puzzle(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return puzzle(interaction.user, interaction);
}

module.exports = {process, interact};
