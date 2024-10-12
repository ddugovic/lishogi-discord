const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const graphSeries = require('../lib/graph-series');
const plural = require('plural');
const User = require('../models/User');

async function playing(user, username) {
    if (!username) {
        username = await getName(user.id);
        if (!username)
            return 'You need to set your playstrategy username with setuser!';
    }
    const url = `https://playstrategy.org/api/user/${username}/current-game?evals=false&moves=false`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => Promise.all([formatCurrentGame(json, username), formatCurrentGameClocks(json)]))
        .then(json => formatCurrentGame(json, username))
        .then(embeds => { return { embeds: embeds.filter(embed => embed) } })
        .catch(error => {
            console.log(`Error in playing(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

async function getName(userId) {
    const user = await User.findById(userId).exec();
    if (user)
        return user.playstrategyName;
}

function formatCurrentGame(game, username) {
    const players = [game.players.p1, game.players.p2];
    const clock = game.clock;
    var embed = new EmbedBuilder()
        .setColor(getColor(game.players))
        .setAuthor({ name: players.map(formatPlayer).join(' - ').replace(/\*\*/g, ''), iconURL: 'https://playstrategy.org/assets/images/lidraughts-32-white.png', url: `https://lidraughts.org/@/${username}/tv` })
        .setThumbnail('https://assets.playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setTitle(`${formatClock(clock, game.daysPerTurn)} ${title(game.perf)} game #${game.id}`)
        .setURL(`https://playstrategy.org/${game.id}`)
        .setDescription(formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(`https://assets.playstrategy.org/game/export/gif/${game.id}.gif`);
    if (game.analysis)
        embed = embed.addFields(formatAnalysis(game.analysis, players.map(getPlayerName)));
    return embed;
}

async function formatCurrentGameClocks(game) {
    if (game.clocks) {
        const image = await formatClocks(game.clocks);
        if (image)
            return new EmbedBuilder().setImage(image);
    }
}

function getColor(players) {
    const rating = ((players.p1.rating ?? 1500) + (players.p2.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `Stockfish level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    const patron = user.patron ? ' 🍺' : '';
    return user.title ? `**${user.title}** ${user.name}${patron}` : `${user.name}${patron}`;
}

function getPlayerName(player) {
    if (player.user)
        return player.user.patron ? `${player.user.name} 🍺` : player.user.name;
    if (player.aiLevel)
        return `Stockfish level ${player.aiLevel}`;
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
        { name: playerNames[0] ?? 'Player 1', value: formatJudgments(white), inline: true },
        { name: playerNames[1] ?? 'Player 2', value: formatJudgments(black), inline: true }
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

function formatClocks(clocks) {
    const data = clocks.reduce((acc, value, ndx) => {
        acc[ndx % 2] = acc[ndx % 2] || [];
        acc[ndx % 2].push(Math.round(value / 100) * (ndx % 2 ? -1 : 1));
        return acc;
    }, []);
    const series = [{ label: 'Sente', data: data[0] }, { label: 'Gote', data: data[1] }];
    const chart = graphSeries(series, 500, 100);
    const url = chart.getUrl();
    if (url.length <= 2000)
        return url;
    if (chart)
        return chart.getShortUrl();
}

function process(bot, msg, username) {
    playing(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
