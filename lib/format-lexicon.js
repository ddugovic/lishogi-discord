function formatLexicon(lexicon) {
    if (lexicon.startsWith('CSW'))
        return 'CSW';
    if (lexicon.startsWith('ECWL'))
        return 'CEL';
    if (lexicon.startsWith('NWL'))
        return 'NWL';
    return lexicon;
}

module.exports = formatLexicon;
