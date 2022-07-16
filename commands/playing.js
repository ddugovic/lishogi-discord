const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const plural = require('plural');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lidraughts username with setuser!';
    }
    const url = `https://lidraughts.org/api/user/${username}/current-game?moves=false`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatCurrentGame(response.data, username))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in playing(${author.username}, ${username}): \
                ${error} ${error.stack}`);
            console.log(`Error in playing(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.lidraughtsName;
}

function formatCurrentGame(game, username) {
    const players = [game.players.white, game.players.black];
    const clock = game.clock;
    var embed = new MessageEmbed()
        .setColor(getColor(game.players))
        .setAuthor({ name: players.map(formatPlayer).join(' - ').replace(/\*\*/g, ''), iconURL: 'https://lidraughts.org/assets/images/lidraughts-32-white.png', url: `https://lidraughts.org/@/${username}/tv` })
        .setThumbnail('https://lidraughts.org/assets/favicon.64.png')
        .setTitle(`${formatClock(clock ? clock.initial : 0, clock ? clock.increment : 0, game.daysPerTurn)} ${title(game.perf)} game #${game.id}`)
        .setURL(`https://lidraughts.org/${game.id}`)
        .setDescription(formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(`https://assets.lidraughts.org/game/export/gif/${game.id}.gif`);
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
    return player.user ? formatUser(player.user) : player.aiLevel ? `Scan level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    const patron = user.patron ? ' ⛃' : '';
    return user.title ? `**${user.title}** ${user.name}${patron}` : `${user.name}${patron}`;
}

function getPlayerName(player) {
    if (player.user)
        return player.user.patron ? `${player.user.name} ⛃` : player.user.name;
    if (player.aiLevel)
        return `Scan level ${player.aiLevel}`;
}

function formatGame(game) {
    const opening = game.opening ? game.opening.name : '';
    return `<t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
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

function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
