function formatOpening(opening, initialFen, moves) {
    const ply = opening ? opening.ply : 10;
    const variation = numberVariation(moves.split(/ /).slice(0, ply));
    return opening ? `${opening.name} *${variation}*` : `*${variation}*`;
}

function numberVariation(moves) {
    var count = 0;
    return chunk(moves, 2).map(pair => `${++count}. ${pair instanceof Array ? pair.join(' ') : pair}`).join(' ');
}

function chunk(arr, size) {
    return Array.from({ length: arr.length / size }, (_, i) => arr.slice(i * size, i * size + size));
}

module.exports = { formatOpening, numberVariation };
