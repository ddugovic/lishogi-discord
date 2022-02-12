const config = require('../config.json');

function help() {
    var helpText = '';
    for (var cmd in commands) {
        var info = config.prefix + cmd;
        var usage = commands[cmd].usage;
        if (usage) {
            info += ' ' + usage;
        }
        var description = commands[cmd].description;
        if (description) {
            info += '\n\t' + description;
        }
        helpText += '```' + info + '```';
    }
    return `Available Commands: \n${helpText}`;
}

function process(commands, msg, username) {
    msg.channel.send(help());
}

function reply(commands, interaction) {
    return help(commands);
}

module.exports = {process, reply};
