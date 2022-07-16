const { MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');

function formatPages(embeds, interaction, message) {
    if (interaction) {
        return embeds.length > 1 ? paginationEmbed(interaction, embeds, formatButtons()) : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    } else {
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
    }
}

function formatButtons() {
    const button1 = new MessageButton()
        .setCustomId('previousbtn')
        .setLabel('Previous')
        .setStyle('PRIMARY');
    const button2 = new MessageButton()
        .setCustomId('nextbtn')
        .setLabel('Next')
        .setStyle('PRIMARY');
    return [button1, button2];
}

module.exports = formatPages;
