const axios = require('axios');
const Discord = require('discord.js');
const html2md = require('html-to-md');
const dcTable = require('@hugop/discord-table/dist/discord-table.js')

async function broadcast(author) {
    const url = 'https://lichess.org/api/broadcast?nb=1';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatBroadcast(response.data))
        .catch(error => {
            console.log(`Error in broadcast(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatBroadcast(broadcast) {
    if (broadcast.tour) {
        const embed = new Discord.MessageEmbed()
            .setAuthor({name: broadcast.tour.name, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
            .setTitle(broadcast.tour.description)
            .setURL(broadcast.tour.url)
            .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
            .setDescription(formatDescription(broadcast.tour.markup))
            .addField('Rounds', broadcast.rounds.sort((a,b) => a.startsAt - b.startsAt).map(formatRound).join('\n'));
        return { 'embeds': [ embed ] };
    } else {
        return 'No broadcast found!';
    }
}

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

function formatDescription(text) {
    text = html2md(text)
    const pattern = /(\|(?:[-,\. \w]+\|)+)\r?\n\|(?:-+\|)+((?:\r?\n\|(?:[-,\. \w]+\|)+)+)/;
    const match = text.match(pattern);
    if (match)
        text = text.replace(match[0], formatTable(match[1], match[2].trim()))
    return text;
}

function formatRound(round) {
    return `<t:${round.startsAt / 1000}:R> ${round.name}`;
}

function process(bot, msg) {
    broadcast(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return broadcast(interaction.user);
}

module.exports = {process, reply};
