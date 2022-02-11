const User = require('../models/User');

async function deleteUser(author, username) {
    if (await User.findByIdAndDelete(author.id).exec()) {
        return `User deleted: ${author.username}`;
    }
    else {
        return 'An error occured in your request.';
    }
}

function process(bot, msg, suffix) {
    deleteUser(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return deleteUser(interaction.user);
}

module.exports = {process, reply};
