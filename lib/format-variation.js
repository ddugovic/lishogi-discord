const western = import('shogiops/notation/western.js');
const sfen = import('shogiops/sfen.js');
const util = import('shogiops/util.js');

async function formatVariation(fen, usis) {
    const { makeWesternMove } = await western;
    const { parseUsi } = await util;
    const moves = [];
    const pos = await setup(fen);
    for (const usi of usis) {
        const move = parseUsi(usi);
        moves.push(makeWesternMove(pos, move).replace('*','\\*'));
        pos.play(move);
    }
    return numberVariation(moves);
}

function numberVariation(moves) {
    var count = 0;
    return moves.map(move => `${++count}. ${move}`).join(' ');
}

async function setup(fen) {
    const { initialSfen, parseSfen } = await sfen;
    return parseSfen('standard', fen ?? initialSfen('standard'), false).unwrap();
}

module.exports = { formatVariation, numberVariation };
