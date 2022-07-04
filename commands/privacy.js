const message = 'This bot only stores your Lishogi username and favorite game mode. Contact <@161060630726574080> if you need your data removed and cannot figure out how to use the deleteuser command.';

function process(bot, msg, username) {
    msg.channel.send(message, { allowedMentions: { users : [] } });
}

function reply(interaction) {
    return { content: message, allowedMentions: { users: [] } };
}

module.exports = { process, reply };
