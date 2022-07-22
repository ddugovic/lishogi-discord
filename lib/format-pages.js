const { ButtonStyle } = require('discord.js');
const Pagination = require('customizable-discordjs-pagination');

function formatPages(embeds, interaction, message) {
    if (interaction) {
        return embeds.length > 1 ? Pagination(interaction, embeds, { buttons: formatButtons() }) : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    } else {
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
    }
}

function formatButtons() {
    return [
        { label: 'Previous', emoji: '⬅', style: ButtonStyle.Primary },
        { label: 'Next', emoji: '➡', style: ButtonStyle.Primary },
    ];
}

module.exports = formatPages;
