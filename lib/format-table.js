const dcTable = require('@hugop/discord-table/dist/discord-table.js')

function strip(line) {
    const pattern = /^\|(.+)\|$/;
    const match = line.match(pattern);
    return match ? match[1] : line;
}

function formatTable(headers, content) {
    headers = strip(headers).split(/\|/).map(s => [s]);
    content = content.split(/\r?\n/).map(line => strip(line).split(/\|/).map(s => [s]));
console.log(content);
    return dcTable.createDiscordTable({
        headers: headers,
        content: content,
        spacesBetweenColumns: headers.map(s => 5),
        maxColumnLengths: headers.map(s => 30)
    }).join('\n');
}

module.exports = formatTable;
