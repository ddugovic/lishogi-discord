const message = 'This bot only stores your Lichess username and favorite game mode. Contact <@161060630726574080> if you need your data removed and cannot figure out how to use the deleteuser command.';

function process(bot, msg, username) {
    msg.channel.send(message);
}

function reply(interaction) {
    return message;
}

module.exports = { process, reply };
