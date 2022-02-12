const User = require('../models/User');

async function whoAmI(author) {
    const user = await User.findById(author.id).exec();
    if (user) {
        return `${author.username} is lishogi user ${user.lishogiName}`;
    }
    else {
        console.log(`Error in whoAmI(${author.id}, ${author.username})`);
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
