const flags = require('emoji-flags');

function formatLang(lang) {
    if (flags.countryCode(lang))
        return flags.countryCode(lang).emoji;
}

module.exports = formatLang;
