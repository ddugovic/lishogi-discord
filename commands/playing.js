const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const formatPages = require('../lib/format-pages');
const { formatGifURL } = require('../lib/format-site-links');
const { formatOpening } = require('../lib/format-variation');
const plural = require('plural');
const User = require('../models/User');

function playing(username, theme, piece, interaction) {
    if (!username) {
        return 'You need to set your lichess username with setuser!';
    }
    const url = `https://lichess.org/api/user/${username}/current-game?accuracy=true&clocks=false&division=false&evals=false`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatCurrentGame(json, username, theme ?? 'brown', piece ?? 'cburnett'))
        .then(embed => formatPages([embed], interaction, 'No game found!'))
        .catch(error => {
            console.log(`Error in playing(${username}, ${theme}, ${piece}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

async function formatCurrentGame(game, username, theme, piece) {
    var embed = new EmbedBuilder()
        .setColor(getColor(game.players))
        .setAuthor({ name: await formatAuthorName(game.players), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${username}/tv` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${formatClock(game.clock, game.daysPerTurn)} ${title(game.perf)} game #${game.id}`)
        .setURL(`https://lichess.org/${game.id}`)
        .setDescription(await formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(formatGifURL(game.id, theme, piece));
    if (game.players.white.analysis || game.players.black.analysis) {
        const players = [game.players.white, game.players.black];
        const playerNames = players.map(getPlayerNameAndAccuracy);
        embed = embed.addFields(formatAnalysis(playerNames, ...players));
    }
    return embed;
}

function getColor(players) {
    const rating = ((players.white.rating ?? 1500) + (players.black.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

async function formatAuthorName(players) {
    if ([players.white, players.black].every(player => player.user))
        players = await setCrosstable(players);
    return [players.white, players.black].map(formatPlayer).join(' - ').replace(/\*\*/g, '');
}

function setCrosstable(players) {
    const url = `https://lichess.org/api/crosstable/${players.white.user.name}/${players.black.user.name}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => formatRecord(players, json.users));
}

function formatRecord(players, users) {
    const whiteRecord = users[players.white.user.name.split(/ /, 2)[0]];
    const blackRecord = users[players.black.user.name.split(/ /, 2)[0]];
    if (whiteRecord + blackRecord) {
        players.white.record = whiteRecord;
        players.black.record = blackRecord;
    }
    return players;
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user, player.record) : player.aiLevel ? `Stockfish level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user, record) {
    const patron = user.patron ? ' 🦄' : '';
    const name = user.title ? `**${user.title}** ${user.name}${patron}` : `${user.name}${patron}`;
    return record != undefined ? `${name} (${record})` : name;
}

function getPlayerNameAndAccuracy(player) {
    const name = getPlayerName(player);
    return player.analysis ? `${name} (${player.analysis.accuracy}%)` : name;
}

function getPlayerName(player) {
    if (player.user)
        return player.user.patron ? `${player.user.name} 🦄` : player.user.name;
    if (player.aiLevel)
        return `Stockfish level ${player.aiLevel}`;
}

async function formatGame(game) {
    const opening = game.moves ? ` ${await formatOpening(game.opening, game.initialFen, game.moves)}` : '';
    return `<t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatAnalysis(playerNames, white, black) {
    const whiteJudgments = { 'Inaccuracy': white.analysis.inaccuracy, 'Mistake': white.analysis.mistake, 'Blunder': white.analysis.blunder };
    const blackJudgments = { 'Inaccuracy': black.analysis.inaccuracy, 'Mistake': black.analysis.mistake, 'Blunder': black.analysis.blunder };
    return [
        { name: playerNames[0] ?? 'White', value: formatJudgments(whiteJudgments), inline: true },
        { name: playerNames[1] ?? 'Black', value: formatJudgments(blackJudgments), inline: true }
    ];
}

function formatJudgments(judgments) {
    return Object.entries(judgments).map(entry => `**${entry[1]}** ${plural(...entry)}`).join('\n');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

function title(str) {
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

async function process(bot, msg, username) {
    const user = await User.findById(msg.author.id).exec();
    playing(username || user?.lichessName).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const user = await User.findById(interaction.user.id).exec();
    const username = interaction.options.getString('username') || user?.lichessName;
    if (!username)
        return 'You need to set your lichess username with setuser!';
    return playing(username, interaction);
}

module.exports = {process, interact};
