const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatEmbeds = require('../lib/format-embeds');
const formatError = require('../lib/format-error');
const { formatHandicap } = require('../lib/format-variant');
const { formatOpening } = require('../lib/format-variation');
const graphSeries = require('../lib/graph-series');
const plural = require('plural');
const User = require('../models/User');

function playing(username, interaction) {
    if (!username) {
        return 'You need to set your lishogi username with setuser!';
    }
    const url = `https://lishogi.org/api/user/${username}/current-game`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => Promise.all([formatCurrentGame(json, username), formatCurrentGameClocks(json)]))
        .then(embeds => formatEmbeds(embeds, interaction, 'No game found!'))
        .catch(error => {
            console.log(`Error in playing(${username}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

async function formatCurrentGame(game, username) {
    var embed = new EmbedBuilder()
        .setColor(getColor(game.players))
        .setAuthor({ name: await formatAuthorName(game.players), iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: `https://lishogi.org/@/${username}/tv` })
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(`${formatClock(game.clock, game.daysPerMove)} ${title(game.perf)} game #${game.id}`)
        .setURL(`https://lishogi.org/${game.id}`)
        .setDescription(await formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(`https://lishogi1.org/game/export/gif/${game.id}.gif`);
    if (game.analysis) {
        const playerNames = [game.players.sente, game.players.gote].map(getPlayerName);
        embed = embed.addFields(formatAnalysis(game.analysis, playerNames));
    }
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
    const rating = ((players.sente.rating ?? 1500) + (players.gote.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

async function formatAuthorName(players) {
    if ([players.sente, players.gote].every(player => player.user))
        players = await setCrosstable(players);
    return [players.sente, players.gote].map(formatPlayer).join(' - ').replace(/\*\*/g, '');
}

function setCrosstable(players) {
    const url = `https://lishogi.org/api/crosstable/${players.sente.user.name}/${players.gote.user.name}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => formatRecord(players, json.users));
}

function formatRecord(players, users) {
    const senteRecord = users[players.sente.user.name.split(/ /, 2)[0]];
    const goteRecord = users[players.gote.user.name.split(/ /, 2)[0]];
    if (senteRecord + goteRecord) {
        players.sente.record = senteRecord;
        players.gote.record = goteRecord;
    }
    return players;
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user, player.record) : player.aiLevel ? `AI level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user, record) {
    const patron = user.patron ? '⛩️' : '';
    const name = user.title ? `**${user.title}** ${user.name}${patron}` : `${user.name}${patron}`;
    return record != undefined ? `${name} (${record})` : name;
}

function getPlayerName(player) {
    if (player.user)
        return player.user.patron ? `${player.user.name} ⛩️` : player.user.name;
    if (player.aiLevel)
        return `AI level ${player.aiLevel}`;
}

async function formatGame(game) {
    const handicap = formatHandicap(game.variant, game.initialSfen);
    const opening = game.moves ? ` ${await formatOpening(game.variant, game.opening, game.initialSfen, game.moves)}` : '';
    return `(${handicap}) <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
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

async function process(bot, msg, username) {
    const user = await User.findById(msg.author.id).exec();
    playing(username || user?.lishogiName).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const user = await User.findById(interaction.user.id).exec();
    const username = interaction.options.getString('username') || user?.lishogiName;
    if (!username)
        return 'You need to set your lishogi username with setuser!';
    return playing(username, interaction);
}

module.exports = {process, interact};
