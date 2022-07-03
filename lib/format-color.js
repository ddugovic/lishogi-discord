function formatColor(red, green, blue) {
    return `#${[red, green, blue].map(formatHue).join('')}`;
}

function formatHue(hue) {
    return hue.toString(16).toUpperCase().padStart(2, 0);
}

module.exports = formatColor;
