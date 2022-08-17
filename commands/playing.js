const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatHandicap = require('../lib/format-handicap');
const { formatVariation } = require('../lib/format-variation');
const plural = require('plural');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lishogi username with setuser!';
    }
    const url = `https://lishogi.org/api/user/${username}/current-game`;
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
        return user.lishogiName;
}

async function formatCurrentGame(game, username) {
    const players = [game.players.sente, game.players.gote];
    const clock = game.clock;
    var embed = new EmbedBuilder()
        .setColor(getColor(game.players))
        .setAuthor({ name: players.map(formatPlayer).join(' - ').replace(/\*\*/g, ''), iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: `https://lishogi.org/@/${username}/tv` })
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(`${formatClock(game.clock.initial, game.clock.increment, game.clock.byoyomi, game.daysPerMove)} ${title(game.perf)} game #${game.id}`)
        .setURL(`https://lishogi.org/${game.id}`)
        .setDescription(await formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(`https://lishogi1.org/game/export/gif/${game.id}.gif`);
    if (game.analysis)
        embed = embed.addFields(formatAnalysis(game.analysis, players.map(getPlayerName)));
    return embed;
}

function getColor(players) {
    const rating = ((players.sente.rating ?? 1500) + (players.gote.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `AI level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    const patron = user.patron ? ' 🦄' : '';
    return user.title ? `**${user.title}** ${user.name}${patron}` : `${user.name}${patron}`;
}

function getPlayerName(player) {
    if (player.user)
        return player.user.patron ? `${player.user.name} 🦄` : player.user.name;
    if (player.aiLevel)
        return `AI level ${player.aiLevel}`;
}

async function formatGame(game) {
    const handicap = formatHandicap(game.initialSfen);
    const opening = game.moves ? ` ${await formatOpening(game.opening, game.initialSfen, game.moves)}` : '';
    return `(${handicap}) <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

async function formatOpening(opening, initialSfen, moves) {
    const variation = await formatVariation(initialSfen, moves.split(/ /).slice(0, opening ? opening.ply : 10));
    return opening ? `${opening.name}\n*${variation}*` : `*${variation}*`;
}

function formatAnalysis(analysis, playerNames) {
    const nodePairs = chunk(analysis.map(getJudgmentName), 2);
    const sente = { 'Inaccuracy': 0, 'Mistake': 0, 'Blunder': 0 };
    const gote = { 'Inaccuracy': 0, 'Mistake': 0, 'Blunder': 0 };
    for (i = 0; i < nodePairs.length; i++) {
        const [senteJudgment, goteJudgment] = nodePairs[i];
        if (senteJudgment) sente[senteJudgment]++;
        if (goteJudgment) gote[goteJudgment]++;
    }
    return [
        { name: playerNames[0] ?? 'Sente', value: formatJudgments(sente), inline: true },
        { name: playerNames[1] ?? 'Gote', value: formatJudgments(gote), inline: true }
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

async function interact(interaction) {
    await interaction.editReply(await playing(interaction.user, interaction.options.getString('username')));
}

module.exports = {process, interact};
