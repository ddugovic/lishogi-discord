const axios = require('axios');
const Discord = require('discord.js');
const { Chess } = require('chessops/chess');
const cfen = require('chessops/fen');
const formatColor = require('../lib/format-color');
const san = require('chessops/san');
const { parseUci } = require('chessops/util');

async function eval(author, fen) {
    const parse = cfen.parseFen(fen.replace(/_/g, ' ') || cfen.INITIAL_FEN);
    if (parse.isOk) {
        const setup = parse.unwrap();
        fen = cfen.makeFen(setup);
        const url = `https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=3`;
        return axios.get(url, { headers: { Accept: 'application/json' } })
            .then(response => formatCloudEval(fen, setup, response.data))
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

function formatCloudEval(fen, setup, eval) {
    const mnodes = Math.floor(eval.knodes / 1000);
    const stats = `Nodes: ${mnodes}M, Depth: ${eval.depth}`;
    const variations = [];
    for (const pv in eval.pvs)
        variations.push(formatVariation(setup, eval.pvs[pv]));
    const red = Math.min(mnodes, 255);

    fen = fen.replace(/ /g,'_');
    const embeds = [
        new Discord.MessageEmbed()
            .setColor(formatColor(red, 0, 255 - red))
            .setAuthor({name: 'Lichess Explorer', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
            .setThumbnail('https://images.prismic.io/lichess/79740e75620f12fcf08a72cf7caa8bac118484d2.png?auto=compress,format')
            .setTitle(':cloud: Cloud Evaluation')
            .setURL(`https://lichess.org/analysis/standard/${fen}#explorer`)
	    .setImage(`https://lichess.org/export/gif/${fen}`),
        new Discord.MessageEmbed()
            .addField(stats, variations.join('\n'))
    ];
    const url = `https://explorer.lichess.ovh/masters?fen=${fen}&moves=0&topGames=3`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatGames(embeds, fen, setup, response.data.topGames));
}

function formatGames(embeds, fen, setup, games) {
    if (games.length)
        embeds.push(new Discord.MessageEmbed().addField('Master Games', games.map(game => formatGame(setup, game)).join('\n')));
    return { embeds: embeds };
}

function formatGame(setup, game) {
    const pos = Chess.fromSetup(setup).unwrap();
    const variation = [parseUci(game.uci)];
    return `${san.makeSanVariation(pos, variation)} [${game.white.name} - ${game.black.name}, ${game.month}](https://lichess.org/${game.id})`;
}

function formatVariation(setup, pv) {
    const pos = Chess.fromSetup(setup).unwrap();
    const variation = pv.moves.split(' ').map(parseUci);
    return `**${formatEval(pv)}**: ${san.makeSanVariation(pos, variation)}`;
}

function formatEval(pv) {
    if (pv.mate)
        return `#${pv.mate}`.replace('#-', '-#');

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, signDisplay: 'always' });
    return formatter.format(pv.cp/100);
}

function process(bot, msg, fen) {
    eval(msg.author, fen).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return eval(interaction.user, interaction.options.getString('fen') ?? '');
}

module.exports = {process, reply};
