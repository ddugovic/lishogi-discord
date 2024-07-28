const User = require('../models/User');

async function setGameMode(author, mode) {
    const newValues = { favoriteMode: mode };
    if (await User.findByIdAndUpdate(author.id, newValues, { upsert: true, new: true }).exec()) {
        return `<@${author.id}> favorite mode ${mode ? 'updated' : 'cleared'}!`;
    } else {
        console.log(`Error in setGameMode(${author}, ${mode})`);
        return 'An error occurred handling your request.';
    }
}

function process(bot, msg, mode) {
    setGameMode(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return setGameMode(interaction.user, interaction.options.getString('mode'));
}

module.exports = { process, interact };
