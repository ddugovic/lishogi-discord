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
            '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['六枚落ち', '6p Down'],
            '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['八枚落ち', '8p Down'],
            '4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['十枚落ち', '10p Down'],
            '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w 3p 1': ['歩三兵', '3 Pawns'],
            '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['裸玉', 'Naked King'],
            'ln2k2nl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['トンボ＋桂香', 'Dragonfly + NL'],
            'l3k3l/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['トンボ＋香', 'Dragonfly + L'],
            '4k4/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1': ['トンボ', 'Dragonfly'],
            'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w L 1': ['香得', 'Lance Gained'],
            'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w B 1': ['角得', 'Bishop Gained'],
            'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w R 1': ['飛車得', 'Rook Gained'],
            'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RL 1': ['飛香得', 'Rook-Lance Gained'],
            'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB 1': ['二枚得', '2-Piece Gained'],
            '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2L 1': ['四枚得', '4-Piece Gained'],
            '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2N2L 1': ['六枚得', '6-Piece Gained'],
            '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2S2N2L 1': ['八枚得', '8-Piece Gained'],
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
