const message = 'This bot only stores your Lidraughts username and favorite game mode. Contact Toadofsky#0954 on Tadpole Pond if you need your data removed and cannot figure out how to use the deleteuser command.';

function process(bot, msg, username) {
    msg.channel.send(message);
}

function reply(interaction) {
    return message;
}

module.exports = {process, reply};
