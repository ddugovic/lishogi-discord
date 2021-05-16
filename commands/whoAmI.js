const User = require('../models/User');

function whoAmI(bot, msg) {
    User.findOne({ playerId: msg.author.id }, (err, result) => {
        if (err) {
            console.log(err);
            msg.channel.send(`There was an error with your request.`);
        }
        if (!result) {
            msg.channel.send(`You need to set your lishogi username with setuser!`);
        } else {
            msg.channel.send(`${msg.author.username} is lishogi user ${result.lishogiName}`);
        }
    });
}

module.exports = whoAmI;
