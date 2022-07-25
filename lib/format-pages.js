const Pagination = require('customizable-discordjs-pagination');

function formatPages(embeds, interaction, message) {
    if (interaction)
        return embeds.length > 1 ? Pagination(interaction, embeds, { selectMenu: { enable: true, placeholder: 'Select Game' } }) : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    else
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
}

module.exports = formatPages;
