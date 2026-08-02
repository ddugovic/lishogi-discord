function timestamp(event, white, black, year, month, day, hour, minute) {
    const millis = Date.UTC(year, month-1, day, hour, minute, 0);
    return `${event} ${white} - ${black}: <t:${millis / 1000}> or <t:${millis / 1000}:R>`;
}

function process(bot, msg, suffix) {
    msg.channel.send(timestamp(...suffix.split(' ')));
}

function reply(interaction) {
    return timestamp(interaction.options.getString('event'), interaction.options.getMember('white'), interaction.options.getMember('black'), interaction.options.getInteger('year'), interaction.options.getInteger('month'), interaction.options.getInteger('day'), interaction.options.getInteger('utc_hour'), interaction.options.getInteger('minute'));
}

module.exports = { process, reply };
