const flags = require('emoji-flags');

function formatCountry(country) {
    if (flags.countryCode(country))
        return flags.countryCode(country).emoji;
}

module.exports = formatCountry;
