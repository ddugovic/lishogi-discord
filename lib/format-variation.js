function numberVariation(moves) {
    var count = 0;
    return chunk(moves, 2).map(pair => `${++count}. ${pair.join(' ')}`).join(' ');
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

module.exports = { numberVariation };
