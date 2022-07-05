const config = require('../config.json');

function stop(userid) {
    if (userid == config.ownerId)
        process.exit();
}

function process(userid) {
    stop(userid);
}

function interact(interaction) {
    stop(interaction.user.id);
}

module.exports = { process, interact };
