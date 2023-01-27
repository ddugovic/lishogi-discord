const { INITIAL_FEN, makeFen, parseFen } = require('chessops/fen');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatPositionURL } = require('../lib/format-site-links');
const { formatUciVariation } = require('../lib/format-variation');

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

function formatCloudEval(fen, eval, theme, piece) {
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
            .setTitle(':cloud: Cloud Evaluation')
            .setURL(`https://lichess.org/analysis/standard/${fenUri}#explorer`)
	    .setImage(formatPositionURL(fen, undefined, theme, piece)),
        new EmbedBuilder()
            .addFields({ name: stats, value: variations.join('\n') })
    ];
    const url = `https://explorer.lichess.ovh/masters?fen=${fen}&topGames=3`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { fen: fen, topGames: 3 } })
        .then(response => response.json())
        .then(json => formatGames(embeds, fen, json.topGames));
}

function formatGames(embeds, fen, games) {
    if (games.length)
        embeds.push(new EmbedBuilder().addFields({ name: 'Master Games', value: games.map(game => formatGame(fen, game)).join('\n') }));
    return { embeds: embeds };
}

function formatGame(fen, game) {
    const variation = [game.uci];
    return `${formatUciVariation(fen, variation)} [${game.white.name} - ${game.black.name}, ${game.month}](https://lichess.org/${game.id})`;
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
