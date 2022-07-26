const Pagination = require('customizable-discordjs-pagination');

function formatPages(name, embeds, interaction, message) {
    if (interaction)
        return embeds.length > 1 ? Pagination(interaction, embeds, { selectMenu: { enable: true, pageOnly: false, placeholder: `Select ${name}` } }) : interaction.editReply(embeds.length ? { embeds : embeds } : message);
    else
        return embeds.length ? { embeds : embeds.slice(0, 1) } : message;
}

module.exports = formatPages;
