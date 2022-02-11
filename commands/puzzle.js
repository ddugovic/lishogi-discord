const message = 'https://lishogi.org/training/daily';

function process(bot, msg) {
    msg.channel.send(message);
}

function reply(interaction) {
    return message;
}

module.exports = puzzle;
