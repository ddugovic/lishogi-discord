async function formatSanVariation(fen, sans) {
    const { makeSanVariation, parseSan } = await import('chessops/san.js');
    const pos = await setup(fen);
    return makeSanVariation(pos.clone(), sans.map(san => {
        move = parseSan(pos, san);
        if (move) pos.play(move);
        return move;
    }));
}

async function formatUciVariation(fen, ucis) {
    const { makeSanVariation, parseSan } = await import('chessops/san.js');
    const { parseUci } = await import('chessops/util.js');
    return makeSanVariation(await setup(fen), ucis.map(parseUci));
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

async function setup(fen) {
    const { INITIAL_FEN, parseFen } = await import('chessops/fen.js');
    const { Chess } = await import('chessops/chess.js');
    const setup = parseFen(fen ?? INITIAL_FEN).unwrap();
    return Chess.fromSetup(setup).unwrap();
}

module.exports = { formatSanVariation, formatUciVariation, numberVariation };
