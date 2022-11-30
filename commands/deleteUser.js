const User = require('../models/User');

async function deleteUser(user, username) {
    if (await User.findByIdAndDelete(author.id).exec()) {
        return `User deleted: ${author.username}`;
    }
    else {
        console.log(`Error in deleteUser(${author.username})`);
        return 'An error occurred handling your request.';
    }
}

function process(bot, msg, suffix) {
    deleteUser(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return deleteUser(interaction.user);
}

module.exports = {process, reply};
