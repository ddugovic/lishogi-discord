const User = require('../models/User');

async function deleteUser(author) {
    if (await User.findByIdAndDelete(author.id).exec()) {
        return `User deleted: <@${author.id}>`;
    }
    else {
        console.log(`Error in deleteUser(${author})`);
        return 'An error occurred handling your request.';
    }
}

function process(bot, msg, suffix) {
    deleteUser(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return await deleteUser(interaction.user);
}

module.exports = { process, reply };
