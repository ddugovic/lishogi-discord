const User = require('../models/User');

async function setUser(author, username) {
    var authorId = author.id;
    var newValues = { lishogiName: username, dateAdded: new Date() };
    if (await User.findByIdAndUpdate(authorId, newValues, {upsert: true, new: true}).exec()) {
        return `User updated! ${author.username} = ${username}`;
    }
    else {
        return 'An error occured in your request.';
    }
}

function process(bot, msg, username) {
    setUser(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return setUser(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
