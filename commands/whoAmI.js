const User = require('../models/User');

function process(bot, msg) {
    User.findOne({ userId: msg.author.id }, (err, result) => {
        if (err) {
            console.log(err);
            msg.channel.send(`There was an error with your request.`);
        }
        if (!result) {
            msg.channel.send(`You need to set your lichess username with setuser!`);
        } else {
            msg.channel.send(`${msg.author.username} is lichess user ${result.lichessName}`);
        }
    });
}

function reply(interaction) {
    return message;
}

module.exports = {process, reply};
