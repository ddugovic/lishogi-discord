const config = require('../config.json');
const { Permissions } = require('discord.js');

function help(commands) {
    var helpText = '```';
    for (const [cmd, command] of Object.entries(commands)) {
        helpText += `${formatCommand(cmd, command)}\n`;
    }
    helpText += '```';
    return helpText;
}

function formatCommand(cmd, command) {
    var info = config.prefix + cmd;
    if (command.usage)
        info += ' ' + command.usage;
    if (command.description)
        info += '\n\t' + command.description;
    return info;
}

function process(commands, client, msg) {
    const permissions = msg.channel.permissionsFor(client.user);
    if (! permissions.any(Permissions.FLAGS.USE_APPLICATION_COMMANDS))
        msg.channel.send(`https://discord.com/blog/slash-commands-are-here ! Re-invite this bot to enable them!\n${help(commands)}`);
    else
        msg.channel.send(`Available Commands:\n${help(commands)}`);
}

function reply(commands, interaction) {
    return `Available Commands:\n${help(commands)}`;
}

module.exports = { process, reply };
