const parse = require('ndjson-parse');

function parseDocument(document) {
    return (typeof document == 'string') ? parse(document) : [document];
}

module.exports = parseDocument;
