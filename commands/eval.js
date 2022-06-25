const axios = require('axios');
const Discord = require('discord.js');
const chess = require('chessops/chess');
const cfen = require('chessops/fen');
const formatColor = require('../lib/format-color');
const san = require('chessops/san');
const util = require('chessops/util');

async function eval(author, fen) {
    const parse = cfen.parseFen(fen || cfen.INITIAL_FEN);
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
        variations.push(formatVariation(fen, setup, eval.pvs[pv]));
    const red = Math.min(mnodes, 255);

    fen = fen.replace(/ /g,'_');
    const embed = new Discord.MessageEmbed()
        .setColor(formatColor(red, 0, 255 - red))
        .setAuthor({name: 'Lichess Explorer', iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(':cloud: Cloud Evaluation')
        .setURL(`https://lichess.org/analysis/standard/${fen}#explorer`)
	.setImage(`https://lichess.org/export/gif/${fen}`);
    const data = new Discord.MessageEmbed()
        .addField(stats, variations.join('\n'));
    return { embeds: [ embed, data ] };
}

function formatVariation(fen, setup, pv) {
    const pos = chess.Chess.fromSetup(setup).unwrap();
    const variation = pv.moves.split(' ').map(uci => util.parseUci(uci));
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
    return eval(interaction.user, interaction.options.getString('fen'));
}

module.exports = {process, reply};
