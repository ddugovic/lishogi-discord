const sfen = import('shogiops/sfen.js');
const csa = import('shogiops/notation/csa/csa.js');
const util = import('shogiops/util.js');

async function formatCsaVariation(fen, csas) {
    const pos = await setup(fen);
    const { makeCsaVariation, parseCsaMoves } = (await csa);
    return makeCsaVariation(pos, parseCsaMoves(pos, csas));
}

async function formatUciVariation(fen, ucis) {
    const { makeCsaVariation } = await csa;
    const { parseUci } = await util;
    const pos = setup(fen);
    return makeCsaVariation(pos, ucis.map(parseUci));
}

function numberVariation(moves) {
    var count = 0;
    return moves.map(move => `${++count}. ${move}`).join(' ');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

async function setup(fen) {
    const { initialSfen, parseSfen } = await sfen;
    return parseSfen('standard', fen ?? initialSfen('standard'));
}

module.exports = { formatCsaVariation, formatUciVariation, numberVariation };
