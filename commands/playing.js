const axios = require('axios');
const Discord = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const { formatSanVariation, numberVariation } = require('../lib/format-variation');
const plural = require('plural');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lichess username with setuser!';
    }
    const url = `https://lichess.org/api/user/${username}/current-game`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatCurrentGame(response.data, username))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in playing(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.lichessName;
}

function formatCurrentGame(game, username) {
    const players = [game.players.white, game.players.black];
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(game.players))
        .setAuthor({ name: players.map(formatPlayer).join(' - ').replace(/\*\*/g, ''), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${username}/tv` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${formatClock(game.clock.initial, game.clock.increment, game.daysPerTurn)} ${title(game.perf)} game #${game.id}`)
        .setURL(`https://lichess.org/${game.id}`)
        .setDescription(formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(`https://lichess1.org/game/export/gif/${game.id}.gif`);
    if (game.analysis)
        embed = embed.addFields(formatAnalysis(game.analysis, players.map(getPlayerName)));
    return embed;
}

function getColor(players) {
    const rating = ((players.white.rating ?? 1500) + (players.black.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `Stockfish level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function getPlayerName(player) {
    if (player.user)
        return player.user.name;
    if (player.aiLevel)
        return `Stockfish level ${player.aiLevel}`;
}

function formatGame(game) {
    const opening = game.moves ? ` ${formatOpening(game.opening, game.initialFen, game.moves)}` : '';
    return `<t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatOpening(opening, initialFen, moves) {
    const variation = moves.split(/ /).slice(0, opening ? opening.ply : 10);
    return opening ? `${opening.name}\n*${formatSanVariation(initialFen, variation)}*` : `*${numberVariation(variation)}*`;
}

function formatAnalysis(analysis, playerNames) {
    const nodePairs = chunk(analysis.map(getJudgmentName), 2);
    const white = { 'Inaccuracy': 0, 'Mistake': 0, 'Blunder': 0 };
    const black = { 'Inaccuracy': 0, 'Mistake': 0, 'Blunder': 0 };
    for (i = 0; i < nodePairs.length; i++) {
        const [whiteJudgment, blackJudgment] = nodePairs[i];
        if (whiteJudgment) white[whiteJudgment]++;
        if (blackJudgment) black[blackJudgment]++;
    }
    return [
        { name: playerNames[0] ?? 'White', value: formatJudgments(white), inline: true },
        { name: playerNames[1] ?? 'Black', value: formatJudgments(black), inline: true }
    ];
}

function formatJudgments(judgments) {
    return Object.entries(judgments).map(entry => `**${entry[1]}** ${plural(...entry)}`).join('\n');
}

function getJudgmentName(node) {
    if (node.judgment)
        return node.judgment.name;
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

function process(bot, msg, username) {
    playing(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
