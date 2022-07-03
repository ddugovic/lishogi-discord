const dcTable = require('@hugop/discord-table/dist/discord-table.js')

function formatTable(headers, content) {
    headers = headers.split(/\|/).slice(1, -1).map(s => [s]);
    content = content.split(/\r?\n/).map(line => line.split(/\|/).slice(1, -1).map(s => [s]));
    return dcTable.createDiscordTable({
        headers: headers,
        content: content,
        spacesBetweenColumns: headers.slice(1).map(s => 5),
        maxColumnLengths: headers.map(s => 30)
    }).join('\n');
}

module.exports = formatTable;
