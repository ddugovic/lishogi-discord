const plural = require('plural');

function formatClock(clock, daysPerTurn) {
    if (clock) {
        clock.initial = clock.initial ?? clock.limit;
        const {byoyomi, increment, initial} = clock;
        const base = initial == 15 ? '¼' : initial == 30 ? '½' : initial == 45 ? '¾' : initial / 60;
        return increment ? `${base}+${increment}` : `${base}|${byoyomi ?? 0}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

module.exports = formatClock;
