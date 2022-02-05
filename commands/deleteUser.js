const User = require('../models/User');

function process(bot, msg, username) {
    var authorId = msg.author.id;
    User.findOne({ userId: authorId }, (err, result) => {
        if (err) {
            console.log(err);
            msg.channel.send('An error occured in your request.');
        }
        if (result) {
            User.deleteOne({ userId: authorId }, (err) => {
                msg.channel.send(`User deleted: ${msg.author.username}`);
            });
        } else {
            msg.channel.send('No user found!');
        }
    });
}

function reply(interaction) {
    return message;
}

module.exports = {process, reply};
