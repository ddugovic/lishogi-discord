const lexica = {
  CSW21: 'Collins Scrabble Words, published under license with Collins, an imprint of HarperCollins Publishers Limited',
  NWL20: 'NASPA Word List, 2020 Edition (NWL20), © 2020 North American Word Game Players Association. All rights reserved.',
  NSWL20: 'NASPA School Word List, 2020 Edition (NWL20), © 2020 North American Word Game Players Association. All rights reserved.',
  ECWL: 'Common English Lexicon, Copyright (c) 2021-2022 Fj00. Used with permission.',
  FRA20: 'Français (French)',
  RD28: 'The “Scrabble®-Turnierliste” used as the German Lexicon is subject to copyright and related rights of Scrabble® Deutschland e.V. With the friendly assistance of Gero Illings SuperDic.',
  NSF21: 'The NSF word list is provided by the language committee of the Norwegian Scrabble Player Association. Used with permission.',
  NSWL20: 'NASPA School Word List 2020 Edition (NSWL20), © 2020 North American Word Game Players Association. All rights reserved.',
  CSW19X: 'SW19X (School Expurgated)',
};

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

module.exports = { formatLexicon, getLexiconCategory };