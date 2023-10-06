function timestamp(event, sente, gote, year, month, day, hour, minute, offset, offsetmin) {
    if (offset < 0 && offsetmin > 0)
        offsetmin = -offsetmin;
    const millis = Date.UTC(year, month-1, day, hour-(offset ?? 0), minute-(offsetmin ?? 0), 0);
    return `${event} ${sente} - ${gote}: <t:${millis / 1000}> or <t:${millis / 1000}:R>`;
}

function process(bot, msg, suffix) {
    msg.channel.send(timestamp(...suffix.split(' ')));
}

async function interact(interaction) {
    await interaction.deferReply();
    return timestamp(interaction.options.getString('event'), interaction.options.getMember('sente'), interaction.options.getMember('gote'), interaction.options.getInteger('year'), interaction.options.getInteger('month'), interaction.options.getInteger('day'), interaction.options.getInteger('local_hour'), interaction.options.getInteger('minute'), interaction.options.getInteger('local_offset'), interaction.options.getInteger('local_offsetmin'));
}

module.exports = { process, interact };
