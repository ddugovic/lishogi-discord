const lexica = {
  CSW19X: 'SW19X (School Expurgated)',
  CSW24: 'Collins Scrabble Words, published under license with Collins, an imprint of HarperCollins Publishers Limited',
  DISC2: "«Diccionari Informatitzat de l'Scrabble en Català» (DISC) is GPLv3-licensed. Copyright 2012 - 2022 Joan Montané.",
  ECWL: 'Common English Lexicon, Copyright (c) 2021-2022 Fj00. Used with permission.',
  FILE2017: 'Español (Spanish), Copyright 2017 Federación Internacional de Léxico en Español',
  FRA24: 'Français (French)',
  NSWL20: 'NASPA School Word List, 2020 Edition (NWL20), © 2020 North American Word Game Players Association. All rights reserved.',
  NWL23: 'NASPA Word List, 2023 Edition (NWL23), © 2023 North American Word Game Players Association. All rights reserved.',
  NSF23: 'The NSF word list is provided by the language committee of the Norwegian Scrabble Player Association. Used with permission.',
  NSWL20: 'NASPA School Word List 2020 Edition (NSWL20), © 2020 North American Word Game Players Association. All rights reserved.',
  OSPS49: 'Copyright 2024 Polska Federacja Scrabble. Used with permission.',
  RD29: 'The “Scrabble®-Turnierliste” used as the German Lexicon is subject to copyright and related rights of Scrabble® Deutschland e.V. With the friendly assistance of Gero Illings SuperDic.'
};

function encodeWord(lexicon, word) {
    if (lexicon == 'FILE2017') {
        if (word.match(/[\[\]]/)) {
            word = word.replaceAll('[CH]','1').replaceAll('[LL]','2').replaceAll('[RR]','3');
            word = word.replaceAll('[','').replaceAll(']','');
        }
        return word.replaceAll(/1|CH/g,'[CH]').replaceAll(/2|LL/g,'[LL]').replaceAll(/3|RR/g,'[RR]');
    }
    return word;
}

function formatLexicon(lexicon) {
    return lexica[lexicon] ?? lexicon;
}

function getLexiconCategory(lexicon) {
    if (lexicon.startsWith('CSW'))
        return 'CSW';
    if (lexicon.startsWith('ECWL'))
        return 'CEL';
    if (lexicon.startsWith('NWL'))
        return 'NWL';
    return lexicon;
}

module.exports = { encodeWord, formatLexicon, getLexiconCategory };
