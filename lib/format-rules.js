const plural = require('plural');

function formatChallengeRule(rule) {
    return rule == 'FIVE_POINT' ? '5 POINT' : rule;
}

function formatClock(initial, increment, overtime) {
    const base = initial == 15 ? '¼' : initial == 30 ? '½' : initial == 45 ? '¾' : initial / 60;
    const main = increment ? `${base}+${increment}` : base;
    return overtime ? `${main}/${overtime}` : main;
}

function formatLayout(layout) {
    return layout.replace('CrosswordGame', '');
}

module.exports = { formatChallengeRule, formatClock, formatLayout };
