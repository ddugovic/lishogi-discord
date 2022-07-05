const config = require('../config.json');

function stop(bot, msg) {
    if (msg.author.username == config.ownerId)
        process.exit();
}

module.exports = stop;
