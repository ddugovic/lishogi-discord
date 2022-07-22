const { ownerId } = require('../config.json');

const message = `This bot only stores your Woogles.io username. Contact <@${ownerId}> if you need your data removed and cannot figure out how to use the deleteuser command.`;

function process(bot, msg, username) {
    msg.channel.send(message);
}

function reply(interaction) {
    return message;
}

module.exports = { process, reply };
