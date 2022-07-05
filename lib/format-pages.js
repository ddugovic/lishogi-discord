const { MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');

function formatPages(embeds, interaction) {
    if (interaction) {
        const button1 = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('Previous')
            .setStyle('PRIMARY');
        const button2 = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('Next')
            .setStyle('PRIMARY');
        return paginationEmbed(interaction, embeds, [button1, button2]);
    } else {
        return { embeds : embeds.slice(0, 3) };
    }
}

module.exports = formatPages;
