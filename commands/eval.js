const { INITIAL_FEN, makeFen, parseFen } = require('chessops/fen');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatPositionURL } = require('../lib/format-site-links');
const { formatUciVariation } = require('../lib/format-variation');
const graphPerfHistory = require('../lib/graph-perf-history');

function eval(author, fen, theme, piece) {
    const parse = parseFen(fen.replace(/_/g, ' ') || INITIAL_FEN);
    if (parse.isOk) {
        fen = makeFen(parse.unwrap());
        const url = `https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=3`;
        let status, statusText;
        return fetch(url, { headers: { Accept: 'application/json' }, params: { fen: fen, multiPv: 3 } })
            .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
            .then(json => formatCloudEval(fen, json, theme ?? 'brown', piece ?? 'cburnett'))
            .catch(error => {
                console.log(`Error in eval(${author.username}, ${fen}, ${theme}, ${piece}): ${error}`);
                return `An error occurred handling your request: ${status} ${statusText}`;
            });
    } else {
        return 'Invalid FEN!';
    }
}

async function formatCloudEval(fen, eval, theme, piece) {
    const requests = [ getHistory(fen), getMasterGames(fen) ];
    const [history, games] = await Promise.all(requests);

    const mnodes = Math.floor(eval.knodes / 1000);
    const stats = `Nodes: ${mnodes}M, Depth: ${eval.depth}`;
    const variations = [];
    for (const pv in eval.pvs)
        variations.push(formatVariation(fen, eval.pvs[pv]));
    const red = Math.min(mnodes, 255);

    const fenUri = fen.replace(/ /g,'+');
    const embeds = [
        new EmbedBuilder()
            .setColor(formatColor(red, 0, 255 - red))
            .setAuthor({name: 'Lichess Explorer', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
            .setThumbnail('https://images.prismic.io/lichess/79740e75620f12fcf08a72cf7caa8bac118484d2.png?auto=compress,format')
            .setTitle(`:cloud: ${getOpeningName(history, games) ?? 'Cloud Evaluation'}`)
            .setURL(`https://lichess.org/analysis/standard/${fenUri}#explorer`)
	    .setImage(formatPositionURL(fen, undefined, theme, piece)),
        new EmbedBuilder()
            .addFields({ name: stats, value: variations.join('\n') })
    ];

    if (history) {
        const image = await formatHistory(history.history);
        if (image)
            embeds.push(new EmbedBuilder().setImage(image));
    }
    if (games.topGames.length) {
        embeds.push(new EmbedBuilder().addFields({ name: 'Master Games', value: games.topGames.map(game => formatGame(fen, game)).join('\n') }));
    }
    return { embeds: embeds };
}

function getOpeningName(history, games) {
    if (history && history.opening)
        return history.opening.name;
    if (games && games.opening)
        return games.opening.name;
}

function getHistory(fen) {
    const url = `https://explorer.lichess.ovh/lichess/history?fen=${fen}`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { fen: fen } })
        .then(response => response.json());
}

function getMasterGames(fen) {
    const url = `https://explorer.lichess.ovh/masters?fen=${fen}&topGames=3`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { fen: fen } })
        .then(response => response.json());
}

function formatGame(fen, game) {
    const variation = [game.uci];
    return `${formatUciVariation(fen, variation)} :chess_pawn: [${game.white.name} - ${game.black.name}, ${game.month}](https://lichess.org/${game.id})`;
}

function formatHistory(months) {
    const [data, history] = getSeries(months);
    if (data.length) {
        const chart = graphPerfHistory(data, history, new Date());
        const url = chart.getUrl();
        return url.length <= 2000 ? url : chart.getShortUrl();
    }
}

function getSeries(months) {
    const data = [];
    const history = [];
    const white = months.map(point => { return { t: Date.parse(point.month), y: point.white } });
    data.push(...white);
    history.push({ label: 'White', data: white });
    const draws = months.map(point => { return { t: Date.parse(point.month), y: point.draws } });
    data.push(...draws);
    history.push({ label: 'Draw', data: draws });
    const black = months.map(point => { return { t: Date.parse(point.month), y: point.black } });
    data.push(...black);
    history.push({ label: 'Black', data: black });
    return [data, history];
}

function formatVariation(fen, pv) {
    const variation = pv.moves.split(' ');
    return `**${formatEval(pv)}**: ${formatUciVariation(fen, variation)}`;
}

function formatEval(pv) {
    if (pv.mate)
        return `#${pv.mate}`.replace('#-', '-#');

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, signDisplay: 'exceptZero' });
    return formatter.format(pv.cp/100);
}

function process(bot, msg, fen) {
    eval(msg.author, fen).then(url => msg.channel.send(url))
}

async function interact(interaction) {
    await interaction.editReply(await eval(interaction.user, interaction.options.getString('fen') ?? '', interaction.options.getString('theme'), interaction.options.getString('piece')));
}

module.exports = {process, interact};
