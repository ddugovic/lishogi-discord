const { Chess } = import('chessops/chess.js');
const { INITIAL_FEN, parseFen } = import('chessops/fen.js');
const { makeSanVariation, parseSan } = import('chessops/san.js');
const { parseUci } = import('chessops/util.js');

function formatSanVariation(fen, sans) {
    const pos = setup(fen);
    return makeSanVariation(pos.clone(), sans.map(san => {
        move = parseSan(pos, san);
        if (move) pos.play(move);
        return move;
    }));
}

function formatUciVariation(fen, ucis) {
    return makeSanVariation(setup(fen), ucis.map(parseUci));
}

function numberVariation(moves) {
    var count = 0;
    return chunk(moves, 2).map(pair => `${++count}. ${pair.join(' ')}`).join(' ');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

function setup(fen) {
    return Chess.fromSetup(parseFen(fen ?? INITIAL_FEN).unwrap()).unwrap();
}

module.exports = { formatSanVariation, formatUciVariation, numberVariation };
