const plural = require('plural');

function formatClock(initial, increment, daysPerTurn) {
    if (initial || increment) {
        const base = initial == 15 ? '¼' : initial == 30 ? '½' : initial == 45 ? '¾' : initial / 60;
        return `${base}+${increment ?? 0}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

module.exports = formatClock;