const axios = require('axios');
const Discord = require('discord.js');
const chess = require('chessops/chess');
const fen = require('chessops/fen');
const san = require('chessops/san');
const util = require('chessops/util');

async function puzzle(author) {
    const url = 'https://lichess.org/api/puzzle/daily';
    return axios.get(url, { headers: { Accept: 'application/x-ndjson' } })
        .then(response => formatPuzzle(response.data.game, response.data.puzzle))
        .catch((error) => {
            console.log(`Error in puzzle(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatPuzzle(game, puzzle) {
    const players = game.players.map(formatPlayer).join(' - ');
    const pos = chess.Chess.default();
    var move;
    for (move of game.pgn.split(' ')) {
        move = san.parseSan(pos, move);
        pos.play(move);
    }
    const uri = fen.makeFen(pos.toSetup()).replaceAll(' ', '_');
    const uci = util.makeUci(move);

    const embed = new Discord.MessageEmbed()
        .setAuthor({ name: players, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/${game.id}` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`:jigsaw: Daily Puzzle #${puzzle.id}`)
        .setURL(`https://lichess.org/training/${puzzle.id}`)
	.setImage(`https://lichess.org/export/gif/${uri}?lastMove=${uci}`);
    const data = new Discord.MessageEmbed()
        .addField('Themes', puzzle.themes.map(title).join(', '));
    return { embeds: [ embed, data ] };
}

function formatPlayer(player) {
    if (player.title)
        return `${player.title} ${player.name.split(' ')[0]}`;
    return player.name;
}

function title(str) {
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

function process(bot, msg, mode) {
    puzzle(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return puzzle(interaction.user);
}

module.exports = {process, reply};
