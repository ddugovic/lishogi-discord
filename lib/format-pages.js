const Pagination = require('customizable-discordjs-pagination');

function formatPages(name, embeds, interaction, message) {
    if (interaction)
        return embeds.length > 1 ? new Pagination().setCommand(interaction).setPages(embeds).setPaginationCollector({ components: 'disappear', ephemeral: false, resetTimer: true, secondaryUserInteraction: true, secondaryUserText: `Select ${name}`, timeout: 120000 }).setSelectMenu({ enable: true, pageOnly: false, placeholder: `Select ${name}` }).setFooter({ enable: true }).send() : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    else
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
}

module.exports = formatPages;
