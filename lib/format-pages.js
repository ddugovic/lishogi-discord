const { MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');

function formatPages(pages, interaction) {
    const button1 = new MessageButton()
        .setCustomId('previousbtn')
        .setLabel('Previous')
        .setStyle('PRIMARY');
    const button2 = new MessageButton()
        .setCustomId('nextbtn')
        .setLabel('Next')
        .setStyle('PRIMARY');
    return paginationEmbed(interaction, pages, [button1, button2]);
}

module.exports = formatPages;
