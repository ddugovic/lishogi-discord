const { ButtonStyle } = require('discord.js');
const Pagination = require('customizable-discordjs-pagination');

function formatChunks(embeds, interaction, message) {
    if (interaction)
        return embeds.length > 1 ? new Pagination().setCommand(interaction).setPages(embeds).setButtons(formatButtons()).setPaginationCollector({ components: 'disappear', secondaryUserInteraction: true }).setFooter({ enable: true }).send() : interaction.reply(embeds.length ? { embeds : embeds } : message);
    else
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
}

function formatPages(embeds, interaction, message) {
    if (interaction) {
        if (embeds.length > 1) {
            new Pagination().setCommand(interaction).setPages(embeds).setButtons(formatButtons()).setPaginationCollector({ components: 'disappear', secondaryUserInteraction: true }).setFooter({ enable: true }).send();
        } else {
            interaction.reply(embeds.length ? { embeds : embeds } : message);
        }
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

module.exports = { formatChunks, formatPages };
