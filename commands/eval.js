const axios = require('axios');
const { INITIAL_FEN, makeFen, parseFen } = require('chessops/fen');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatUciVariation } = require('../lib/format-variation');

function eval(author, fen) {
    const parse = parseFen(fen.replace(/_/g, ' ') || INITIAL_FEN);
    if (parse.isOk) {
        fen = makeFen(parse.unwrap());
        const url = `https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=3`;
        return axios.get(url, { headers: { Accept: 'application/json' } })
            .then(response => formatCloudEval(fen, response.data))
            .catch(error => {
                console.log(`Error in eval(${author.username}): \
                    ${error.response.status} ${error.response.statusText}`);
                return `An error occurred handling your request: \
                    ${error.response.status} ${error.response.statusText}`;
        });
    } else {
        return 'Invalid FEN!';
    }
}

function formatCloudEval(fen, eval) {
    const mnodes = Math.floor(eval.knodes / 1000);
    const stats = `Nodes: ${mnodes}M, Depth: ${eval.depth}`;
    const variations = [];
    for (const pv in eval.pvs)
        variations.push(formatVariation(fen, eval.pvs[pv]));
    const red = Math.min(mnodes, 255);

    const fenUri = fen.replace(/ /g,'_');
    const embeds = [
        new Discord.EmbedBuilder()
            .setColor(formatColor(red, 0, 255 - red))
            .setAuthor({name: 'Lichess Explorer', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
            .setThumbnail('https://images.prismic.io/lichess/79740e75620f12fcf08a72cf7caa8bac118484d2.png?auto=compress,format')
            .setTitle(':cloud: Cloud Evaluation')
            .setURL(`https://lichess.org/analysis/standard/${fenUri}#explorer`)
	    .setImage(`https://lichess.org/export/gif/${fenUri}`),
        new Discord.EmbedBuilder()
            .addField(stats, variations.join('\n'))
    ];
    const url = `https://explorer.lichess.ovh/masters?fen=${fenUri}&moves=0&topGames=3`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatGames(embeds, fen, response.data.topGames));
}

function formatGames(embeds, fen, games) {
    if (games.length)
        embeds.push(new Discord.EmbedBuilder().addField('Master Games', games.map(game => formatGame(fen, game)).join('\n')));
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
    await interaction.editReply(eval(interaction.user, interaction.options.getString('fen') ?? ''));
}

module.exports = {process, interact};
