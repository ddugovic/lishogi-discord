function timestamp(event, sente, gote, year, month, day, hour, minute) {
    const millis = Date.UTC(year, month-1, day, hour, minute, 0);
    return `${event} ${sente} - ${gote}: <t:${millis / 1000}> or <t:${millis / 1000}:R>`;
}

function process(bot, msg, suffix) {
    msg.channel.send(timestamp(...suffix.split(' ')));
}

async function interact(interaction) {
    await interaction.deferReply();
    return timestamp(interaction.options.getString('event'), interaction.options.getMember('sente'), interaction.options.getMember('gote'), interaction.options.getInteger('year'), interaction.options.getInteger('month'), interaction.options.getInteger('day'), interaction.options.getInteger('utc_hour'), interaction.options.getInteger('minute'));
}

module.exports = { process, interact };
