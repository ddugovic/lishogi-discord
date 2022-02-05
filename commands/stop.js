const config = require('../config.json');

function process(bot, msg) {
    if (msg.author.id == config.owner) {
        process.exit();
    }
}

function reply(interaction) {
    if (interaction.author.id == config.owner) {
        process.exit();
    }
    return '';
}

module.exports = {process, reply};
