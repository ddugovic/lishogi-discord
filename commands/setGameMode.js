const User = require('../models/User');

async function setGameMode(author, mode) {
    var authorId = author.id;
    var newValues = { favoriteMode: mode };
    if (await User.findByIdAndUpdate(authorId, newValues, {new: true}).exec()) {
        return `${author.username} favorite mode updated!`;
    }
    else {
        return 'You need to set your lishogi username with setuser!';
    }
}

function process(bot, msg, mode) {
    setGameMode(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return setGameMode(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
