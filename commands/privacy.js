const { ownerId } = require('../config.json');

const message = `This bot only stores your Lishogi username and favorite game mode. Contact <@${ownerId}> if you need your data removed and cannot figure out how to use the deleteuser command.`;

function process(bot, msg, username) {
    msg.channel.send(message);
}

function interact(interaction) {
    return message;
}

module.exports = { process, interact };
