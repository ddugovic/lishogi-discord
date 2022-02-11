const config = require('../config.json');
const commands = require('../commands');

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

function process(bot, msg, username) {
    msg.channel.send(help());
}

function reply(interaction) {
    return help();
}

module.exports = {process, reply};
