const plural = require('plural');

function formatClock(clock, daysPerTurn) {
    if (clock) {
        const {byoyomi, increment, initial, limit} = clock;
        const base = formatDuration(limit ?? 0, initial ?? 0);
        return increment ? `${base}+${increment}` : `${base}|${byoyomi ?? 0}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

function formatDuration(minutes, seconds) {
    seconds += minutes * 60;
    return seconds == 15 ? '¼' : seconds == 30 ? '½' : seconds == 45 ? '¾' : seconds / 60;
}

module.exports = formatClock;
