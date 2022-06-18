const axios = require('axios');
const chess = require('chessops/chess');
const cfen = require('chessops/fen');
const san = require('chessops/san');
const util = require('chessops/util');

async function eval(author, fen) {
    if (fen && cfen.parseFen(fen).isOk) {
        const url = `https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=3`;
        return axios.get(url, { headers: { Accept: 'application/vnd.lichess.v3+json' } })
            .then(response => formatCloudEval(fen, response.data))
            .catch((err) => {
                console.log(`Error in eval(${author.username}): \
                    ${err.response.status} ${err.response.statusText}`);
                return `An error occurred handling your request: \
                    ${err.response.status} ${err.response.statusText}`;
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
        const variation = pvs[pv]['moves'].split(' ').map(uci => util.parseUci(uci));
        message.push(`${formatter.format(pvs[pv]['cp']/100)}: ${san.makeSanVariation(pos, variation)}`);
    }
    message += (`https://lichess.org/analysis/standard/${fen.replace(/ /g,'_')}#explorer`);
    return message.join('\n');
}

function process(bot, msg, fen) {
    eval(msg.author, fen).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return eval(interaction.user, interaction.options.getString('fen'));
}

module.exports = {process, reply};
