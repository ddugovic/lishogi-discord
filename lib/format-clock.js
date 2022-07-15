const plural = require('plural');

function formatClock(initial, increment, byoyomi, daysPerTurn) {
    if (initial || increment || byoyomi) {
        const base = initial == 15 ? '¼' : initial == 30 ? '½' : initial == 45 ? '¾' : initial / 60;
        return increment ? `${base}+${increment}` : `${base}|${byoyomi ?? 0}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

module.exports = formatClock;
