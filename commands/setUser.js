const User = require('../models/User');

async function setUser(author, username) {
    const newValues = { lichessName: username, dateAdded: new Date() };
    if (await User.findByIdAndUpdate(author.id, newValues, { upsert: true, new: true }).exec()) {
        return `User updated! <@${author.id}> = ${username}`;
    }
    else {
        console.log(`Error in setUser(${author.username}, ${username})`);
        return 'An error occurred handling your request.';
    }
}

function process(bot, msg, username) {
    setUser(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return await setUser(interaction.user, interaction.options.getString('username'));
}

module.exports = { process, reply };
