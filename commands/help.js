const config = require('../config.json');

function help(commands) {
    var helpText = '```';
    for (const [cmd, command] of Object.entries(commands)) {
        helpText += `${formatCommand(cmd, command)}\n`;
    }
    helpText += '```';
    return `Available Commands: \n${helpText}`;
}

function formatCommand(cmd, command) {
    var info = config.prefix + cmd;
    if (command.usage)
        info += ' ' + command.usage;
    if (command.description)
        info += '\n\t' + command.description;
    return info;
}

function process(commands, msg, username) {
    msg.channel.send(help(commands));
}

function reply(commands, interaction) {
    return help(commands);
}

module.exports = {process, reply};
