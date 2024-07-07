const plural = require('plural');

function formatClock(clock, daysPerTurn) {
    if (clock) {
        const base = clock.initial ?? clock.limit;
        const extra = clock.byoyomi ? `|${clock.byoyomi}` : clock.delay ? `d/${clock.delay}` : `+${clock.increment ?? 0}`;
        return `${base == 15 ? '¼' : base == 30 ? '½' : base == 45 ? '¾' : base / 60}${extra}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

module.exports = formatClock;
