const { EmbedBuilder } = require('discord.js');
const formatPages = require('../lib/format-pages');
const lexica = ['CSW', 'TWL'];

function equity(user, lexicon, rack, interaction) {
    const url = `https://cross-tables.com/leaves_values.php?lexicon=${lexicon}&rack=${rack}`
    const headers = { Accept: 'application/json', 'User-Agent': 'Woogles Statbot' };
    let status, statusText;
    return fetch(url, { headers: headers })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatPages('Rack', json.error ? [] : [formatEquity(lexicon, json)], interaction, json.error))
        .catch(error => {
            console.log(`Error in equity(${user.username}, ${lexicon}, ${rack}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatEquity(lexicon, equity) {
    const letterInfo = chunk(Object.entries(equity['letter-info']), 9);
    return new EmbedBuilder()
        .setAuthor({ name: 'cross-tables.com', iconURL: 'https://cross-tables.com/i/logo-tile.png', url: 'https://www.cross-tables.com/leaves.php' })
        .setTitle(`${equity.rack} (${lexicon})`)
        .setDescription(`**${equity['rack-value']}**`)
        .addFields(letterInfo.map(infos => { return { name: 'Tiles', value: infos.map(formatTileInfo).join('\n'), inline: true }; }));
}

function formatTileInfo(info) {
    return info[1] == -9999 ? `${formatTile(info[0])}` : `${formatTile(info[0])} ${info[1]}`;
}

function formatTile(tile) {
    return tile == 'blank' ? ':blue_square:' : `:regional_indicator_${tile.toLowerCase()}:`;
}

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

async function process(bot, msg, suffix) {
    const [lexicon, rack] = suffix.toUpperCase().split(/[^A-Z?]+/i, 2);
    if (lexica.includes(lexicon) && rack)
        await equity(msg.author, lexicon, rack).then(message => msg.channel.send(message));
    else
        await msg.channel.send(lexica.includes(lexicon) ? 'Rack not specified!' : 'Lexicon not found!');
}

async function interact(interaction) {
    await interaction.deferReply();
    equity(interaction.user, interaction.options.getString('lexicon'), interaction.options.getString('rack').toUpperCase(), interaction);
}

module.exports = { process, interact };
