async function coach(author) {
    return 'https://lichess.org/coach';
}

function process(bot, msg) {
    coach(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return coach(interaction.user);
}

module.exports = {process, reply};
