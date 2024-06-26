function formatHandicap(variant, initialSfen, lang) {
    if (initialSfen || variant == 'standard') {
        initialSfen = initialSfen ?? 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
        const handicaps = {
            'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['平手', 'Even'],
            'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['香落ち', 'Lance Down'],
            '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['右香落ち', 'Lance Down'],
            'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['角落ち', 'Bishop Down'],
            'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['飛車落ち', 'Rook Down'],
            'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['飛香落ち', 'Rook+Lance Down'],
            'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['二枚落ち', '2p Down'],
            'lnsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['三枚落ち', '3p Down'],
            '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['四枚落ち', '4p Down'],
            '2sgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['五枚落ち', '5p Down'],
            '1nsgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['左五枚落ち', '5p Down'],
            '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['六枚落ち', '4p Down'],
            '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['八枚落ち', '6p Down'],
            '4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['十枚落ち', '8p Down'],
        };
        const handicap = handicaps[initialSfen] ?? ['その他', 'Other'];
        return handicap[lang == 'jp' ? 0 : 1];
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
