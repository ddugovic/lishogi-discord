const User = require('../models/User');

function setGameMode(bot, msg, suffix) {
    var authorId = msg.author.id;
    var mode = suffix.toLowerCase();
    User.findOne({ playerId: authorId }, (err, result) => {
        if (err) {
            console.log(err);
        }
        if (!result) {
            msg.channel.send('You need to set your lishogi username with setuser!');
        } else {
            var newValues = { $set: { favoriteMode: mode } };
            User.updateOne({ playerId: authorId }, newValues, (err, updateResult) => {
                msg.channel.send(`${msg.author.username} favorite mode updated!`);
            });
        }
    });
}
module.exports = setGameMode;
