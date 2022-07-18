const { ButtonBuilder, ButtonStyle } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');

function formatPages(embeds, interaction, message) {
    if (interaction) {
        return embeds.length > 1 ? paginationEmbed(interaction, embeds, formatButtons()) : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    } else {
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
    }
}

function formatButtons() {
    const button1 = new ButtonBuilder()
        .setCustomId('previousbtn')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary);
    const button2 = new ButtonBuilder()
        .setCustomId('nextbtn')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary);
    return [button1, button2];
}

module.exports = formatPages;
