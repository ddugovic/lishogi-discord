function formatFlair(flair) {
    if (flair == 'activity.lichess-horsey')
        return ':horse:';
    if (flair == 'activity.lichess-horsey-yin-yang')
        return ':yin_yang:';
}

module.exports = formatFlair;
