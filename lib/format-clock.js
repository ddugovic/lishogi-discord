const plural = require('plural');

function formatClock(clock, daysPerTurn) {
    if (clock) {
        const base = clock.initial ?? clock.limit;
        return `${base == 15 ? '¼' : base == 30 ? '½' : base == 45 ? '¾' : base / 60}+${clock.increment}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

module.exports = formatClock;
