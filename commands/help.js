const config = require('../config.json');
const commands = require('../commands');

function getHelp() {
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
    msg.channel.send(getHelp());
}

function reply(interaction) {
    return getHelp();
}

module.exports = {process, reply};

