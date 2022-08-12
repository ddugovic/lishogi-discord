function formatChallengeRule(rule) {
    return rule == 'FIVE_POINT' ? '5 POINT' : (rule == 'TEN_POINT' ? '10 POINT' : rule);
}

function formatCategory(layout, initial, increment, overtime) {
    return `${layout.replace('CrosswordGame', '')} ${formatSpeed(initial, increment, overtime)}`;
}

function formatClock(initial, increment, overtime) {
    const base = initial == 15 ? '¼' : initial == 30 ? '½' : initial == 45 ? '¾' : initial / 60;
    const main = increment ? `${base}+${increment}` : base;
    return overtime ? `${main}/${overtime}` : main;
}

function formatSpeed(initial, increment, overtime) {
    const turnsPerGame = 16;
    const totalTime = initial + overtime * 60 + increment * turnsPerGame;
    return totalTime <= 2 * 60 ? 'Ultra-Blitz!' :
        totalTime <= 6 * 60 ? 'Blitz' :
        totalTime <= 14 * 60 ? 'Rapid' : 'Classical';
}

module.exports = { formatChallengeRule, formatCategory, formatClock };
