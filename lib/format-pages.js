const { ButtonStyle } = require('discord.js');
const Pagination = require('customizable-discordjs-pagination');

function formatPages(embeds, interaction, message) {
console.log(embeds);
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

module.exports = formatPages;
