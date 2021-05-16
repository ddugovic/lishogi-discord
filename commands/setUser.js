const User = require('../models/User');

function setUser(bot, msg, suffix) {
    var authorId = msg.author.id;
    var username = suffix;
    User.findOne({ playerId: authorId }, (err, result) => {
        if (err) {
            console.log(err);
            msg.channel.send('An error occured in your request.');
        }
        if (!result) {
            User.create({ playerId: authorId, lishogiName: username }, (err, createResult) => {
                msg.channel.send(`User added! ${msg.author.username}  =  ${username}`);
            });
        }
        else {
            if ((new Date() - result.dateAdded) < (60 * 1000)) { // 1 minute
                msg.channel.send('You may update your name once per minute. Try again later.');
            }
            else {
                var newValues = { $set: { lishogiName: username, dateAdded: new Date() } };
                User.updateOne({ playerId: authorId }, newValues, (err, updateResult) => {
                    msg.channel.send(`User updated!  ${msg.author.username} = ${username}`);
                });
            }
        }
    });
}
module.exports = setUser;
