const User = require('../models/User');

async function whoAmI(author) {
    var authorId = author.id;
    const user = await User.findById(authorId).exec();
    if (user) {
        return `${author.username} is lishogi user ${user.lishogiName}`;
    }
    else {
        return `You need to set your lishogi username with setuser!`;
    }
}

function process(bot, msg, suffix) {
    whoAmI(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return whoAmI(interaction.user);
}

module.exports = {process, reply};
