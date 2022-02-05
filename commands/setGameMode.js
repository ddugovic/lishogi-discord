const User = require('../models/User');

function process(bot, msg, suffix) {
    var authorId = msg.author.id;
    var mode = suffix.toLowerCase();
    User.findOne({ userId: authorId }, (err, result) => {
        if (err) {
            console.log(err);
        }
        if (!result) {
            msg.channel.send('You need to set your lichess username with setuser!');
        } else {
            var newValues = { $set: { favoriteMode: mode } };
            User.updateOne({ userId: authorId }, newValues, (err, updateResult) => {
                msg.channel.send(`${msg.author.username} favorite mode updated!`);
            });
        }
    });
}

function reply(interaction) {
    return message;
}

module.exports = {process, reply};
