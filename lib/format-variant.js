function formatVariant(variant) {
    if (variant == 'kingOfTheHill')
        return 'King of the Hill';
    if (variant == 'racingKings')
        return 'Racing Kings';
    variant = variant.replace(/([a-z])([A-Z])/g, '$1-$2');
    return variant.charAt(0).toUpperCase() + variant.slice(1);
}

module.exports = formatVariant
