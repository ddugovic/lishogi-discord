const util = import('shogiops/handicaps');

async function formatHandicap(variant, initialSfen, lang) {
    const { findHandicap, isHandicap } = await util;
    if (initialSfen || variant == 'standard') {
        initialSfen = initialSfen ?? 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
        const handicapExists = isHandicap({sfen: initialSfen});
        const handicap = findHandicap({sfen: initialSfen});
        if (handicapExists) {
          if (handicap) {
            return lang == 'jp' ? handicap.japaneseName : handicap.englishName;
          }
          return lang == 'jp' ? 'その他' : 'Other';
        }
        return lang == 'jp' ? '平手' : 'Even';
    }
    return formatVariant(variant);
}

function formatVariant(variant) {
    if (variant == 'chushogi')
        return 'Chu Shogi';
    variant = variant.replace(/([a-z])([A-Z])/g, '$1-$2');
    return variant.charAt(0).toUpperCase() + variant.slice(1);
}

module.exports = { formatHandicap, formatVariant };
