function formatEmbeds(embeds, interaction, message) {
    embeds = embeds.filter(embed => embed);
    if (interaction) {
        interaction.reply(embeds.length ? { embeds : embeds } : message);
    } else {
        return embeds.length ? { embeds : embeds } : message;
    }
}

module.exports = formatEmbeds;
