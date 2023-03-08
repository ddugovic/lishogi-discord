const { ButtonStyle } = require('discord.js');
const Pagination = require('customizable-discordjs-pagination');

function formatChunks(embeds, interaction, message) {
    if (interaction)
        return embeds.length > 1 ? new Pagination().setCommand(interaction).setPages(embeds).setButtons(formatButtons()).setPaginationCollector({ components: 'disappear', secondaryUserInteraction: true }).setFooter({ enable: true }).send() : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    else
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
}

function formatError(status, statusText, interaction, message) {
    if (status)
        message = `An error occurred handling your request: ${status} ${statusText}`;
    else
        message = `An error occurred handling your request: ${message}`;
    return interaction ? interaction.editReply(message) : message;
}

function formatPages(name, embeds, interaction, message) {
    if (interaction)
        return embeds.length > 1 ? new Pagination().setCommand(interaction).setPages(embeds.slice(0, 20)).setPaginationCollector({ components: 'disappear', ephemeral: false, resetTimer: true, timeout: 120000 }).setSelectMenu({ enable: true, pageOnly: false, placeholder: `Select ${name}` }).setFooter({ enable: true }).send() : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    else
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
}

function formatButtons() {
    return [
        { label: 'Previous', emoji: '⬅', style: ButtonStyle.Primary },
        { label: 'Next', emoji: '➡', style: ButtonStyle.Primary },
    ];
}

module.exports = { formatChunks, formatError, formatPages };
