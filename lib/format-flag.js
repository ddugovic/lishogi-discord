const flags = require('emoji-flags');

function formatFlag(code) {
    if (flags.countryCode(code))
        return flags.countryCode(code).emoji;
}

module.exports = formatFlag;
