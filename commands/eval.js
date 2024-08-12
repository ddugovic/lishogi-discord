const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatChunks } = require('../lib/format-pages');
const { formatPositionURL } = require('../lib/format-site-links');
const { formatUciVariation } = require('../lib/format-variation');
const graphPerfHistory = require('../lib/graph-perf-history');

async function eval(fen, theme, piece, since, until, interaction) {
    const { INITIAL_FEN, makeFen, parseFen } = await import('chessops/fen.js');
    const parse = parseFen(fen.replace(/_/g, ' ') || INITIAL_FEN);
    if (parse.isOk) {
        fen = makeFen(parse.unwrap());
        const url = `https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=3`;
        const now = new Date();
        let status, statusText;
        return fetch(url, { headers: { Accept: 'application/json' }, params: { fen: fen, multiPv: 3 } })
            .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
            .then(json => formatCloudEval(fen, json, theme ?? 'brown', piece ?? 'cburnett', since ?? 1952, until ?? now.getFullYear()))
            .then(embeds => formatChunks(embeds, interaction, 'No cloud evaluation found!'))
            .catch(error => {
                console.log(`Error in eval(${fen}, ${theme}, ${piece}, ${since}, ${until}): ${error}`);
                return formatError(status, statusText, `${url} failed to respond`);
            });
    } else {
        return 'Invalid FEN!';
    }
}

async function formatCloudEval(fen, eval, theme, piece, since, until) {
    const requests = [ getHistory(fen), getMasterGames(fen, since, until) ];
    const [history, games] = await Promise.all(requests);

    const mnodes = Math.floor(eval.knodes / 1000);
    const stats = `Nodes: ${mnodes}M, Depth: ${eval.depth}`;
    const variations = await Promise.all(eval.pvs.map(pv => formatVariation(fen, pv)));
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
        const lines = await Promise.all(games.topGames.map(game => formatGame(fen, game)));
        embeds.push(new EmbedBuilder().addFields({ name: 'Master Games', value: lines.join('\n') }));
    }
    return embeds;
}

function getOpeningName(history, games) {
    if (history && history.opening)
        return history.opening.name;
    if (games && games.opening)
        return games.opening.name;
}

function getHistory(fen) {
    const now = new Date();
    const url = `https://explorer.lichess.ovh/lichess/history?fen=${fen}&since=${now.getFullYear()-5}-${now.getMonth()}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json());
}

function getMasterGames(fen, since, until) {
    const url = `https://explorer.lichess.ovh/masters?fen=${fen}&topGames=3&since=${since}&until=${until}`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { fen: fen, since: since, until: until } })
        .then(response => response.json());
}

async function formatGame(fen, game) {
    const variation = [game.uci];
    const line = await formatUciVariation(fen, variation);
    return `${line} :chess_pawn: [${game.white.name} - ${game.black.name}](https://lichess.org/${game.id}) *${game.month}*`;
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

async function formatVariation(fen, pv) {
    const variation = pv.moves.split(' ');
    const line = await formatUciVariation(fen, variation);
    return `**${formatEval(pv)}**: ${line}`;
}

function formatEval(pv) {
    if (pv.mate)
        return `#${pv.mate}`.replace('#-', '-#');

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, signDisplay: 'exceptZero' });
    return formatter.format(pv.cp/100);
}

function process(bot, msg, suffix) {
    eval(...suffix.split(/ /, 2)).then(message => msg.channel.send(message))
}

async function interact(interaction) {
    return interaction.reply(await eval(interaction.options.getString('fen') ?? '', interaction.options.getString('theme'), interaction.options.getString('piece'), interaction.options.getInteger('since'), interaction.options.getInteger('until'), interaction));
}

module.exports = {process, interact};
