const plural = require('plural');

function formatChallengeRule(rule) {
    return rule == 'FIVE_POINT' ? '5 POINT' : rule;
}

function formatClock(initial, increment, overtime, daysPerTurn) {
    if (initial || increment) {
        const base = initial == 15 ? '¼' : initial == 30 ? '½' : initial == 45 ? '¾' : initial / 60;
        const main = increment ? `${base}+${increment}` : base;
        return overtime ? `${main}/${overtime}` : main;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

module.exports = { formatChallengeRule, formatClock};
