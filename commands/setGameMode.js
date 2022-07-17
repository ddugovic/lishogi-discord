const User = require('../models/User');

async function setGameMode(author, mode) {
    if (await User.findByIdAndUpdate(author.id, {favoriteMode: mode}, {new: true}).exec()) {
        return `${author.username} favorite mode ${mode ? 'updated' : 'cleared'}!`;
    }
    else {
        console.log(`Error in setGameMode(${author.username}, ${mode})`);
        return 'You need to set your lichess username with setuser!';
    }
}

function process(bot, msg, mode) {
    setGameMode(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return await setGameMode(interaction.user, interaction.options.getString('mode'));
}

module.exports = { process, reply };
