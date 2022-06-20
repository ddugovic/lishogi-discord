const axios = require('axios');
const chess = require('chessops/chess');
const cfen = require('chessops/fen');
const san = require('chessops/san');
const util = require('chessops/util');

async function eval(author, fen) {
    console.log(fen);
    if (fen && cfen.parseFen(fen).isOk) {
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
        return fen ? 'Invalid FEN!' : 'Missing FEN!'
    }
}

function formatCloudEval(fen, eval) {
    const setup = cfen.parseFen(fen).unwrap();
    const pos = chess.Chess.fromSetup(setup).unwrap();
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, signDisplay: 'always' });
    var message = [`Nodes: ${Math.floor(eval['knodes']/1000)}M, Depth: ${eval['depth']}`];
    for (const pv in eval.pvs) {
        const variation = eval.pvs[pv]['moves'].split(' ').map(uci => util.parseUci(uci));
        message.push(`${formatter.format(eval.pvs[pv]['cp']/100)}: ${san.makeSanVariation(pos, variation)}`);
    }
    message += `\nhttps://lichess.org/analysis/standard/${fen.replace(/ /g,'_')}#explorer`;
    return message;
}

function process(bot, msg, fen) {
    eval(msg.author, fen).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return eval(interaction.user, interaction.options.getString('fen'));
}

module.exports = {process, reply};
