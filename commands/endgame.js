const { ownerId } = require('../config.json');

const message = 'Practice endgames at https://blitztactics.com/positions !';

function process(bot, msg, username) {
    msg.channel.send(message);
}

function reply(interaction) {
    return message;
}

module.exports = { process, reply };
