const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatPages = require('../lib/format-pages');

function equity(lexicon, rack, interaction) {
    const url = `https://cross-tables.com/leaves_values.php?lexicon=${lexicon}&rack=${rack}`
    const context = { Accept: 'application/json', 'User-Agent': 'Woogles Statbot' };
    return axios.get(url, { headers: context })
        .then(response => formatPages('Rack', response.data.error ? [] : [formatEquity(response.data)], interaction, response.data.error))
        .catch(error => {
            console.log(`Error in equity(): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                [I${error.response.status} ${error.response.statusText}`;
        });
}

function formatEquity(equity) {
    const letterInfo = Object.entries(equity['letter-info']).map(info => `${formatTile(info[0])} ${info[1]}`);
    return new EmbedBuilder()
        .setAuthor({ name: 'cross-tables.com', url: 'https://www.cross-tables.com/leaves.php' })
        .setTitle(equity.rack)
        .setDescription(`**${equity['rack-value']}**\n${letterInfo.join('\n')}`);
}

function formatTile(tile) {
    return tile == 'blank' ? ':blue_square:' : `:regional_indicator_${tile.toLowerCase()}:`;
}

const lexica = {
  CSW: 1,
  TWL: 0
}

async function process(bot, msg, suffix) {
    const [lexicon, rack] = suffix.toUpperCase().split(/[^A-Z?]+/i, 2);
    if ((lexicon in lexica) && rack)
        await equity(lexicon, rack).then(message => msg.channel.send(message));
    else
        await msg.channel.send(lexica[lexicon] ? 'Rack not specified!' : 'Lexicon not found!');
}

async function interact(interaction) {
    await interaction.deferReply();
    equity(interaction.options.getString('lexicon'), interaction.options.getString('rack').toUpperCase(), interaction);
}

module.exports = { process, interact };
