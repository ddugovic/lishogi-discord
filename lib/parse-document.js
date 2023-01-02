const parse = require('ndjson-parse');

function parseDocument(document) {
    if (Array.isArray(document))
        return document;
    return (typeof document == 'string') ? parse(document) : [document];
}

module.exports = parseDocument;
