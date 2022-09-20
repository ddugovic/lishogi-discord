function timestamp(sente, gote, year, month, day, hour, minute, offset) {
    const millis = Date.UTC(year, month-1, day, hour-(offset ?? 0), minute ?? 0, 0);
    return `${sente} - ${gote}: <t:${millis / 1000}> or <t:${millis / 1000}:R>`;
}

function process(bot, msg, suffix) {
    msg.channel.send(timestamp(...suffix.split(' ')));
}

async function interact(interaction) {
    await interaction.deferReply();
    return timestamp(interaction.options.getUser('sente'), interaction.options.getMember('gote'), interaction.options.getInteger('year'), interaction.options.getInteger('month'), interaction.options.getInteger('day'), interaction.options.getInteger('hour'), interaction.options.getInteger('minute'), interaction.options.getInteger('offset'));
}

module.exports = { process, interact };
