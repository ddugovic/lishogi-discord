// Include commands
const deleteUser = require('./commands/deleteUser');
const gif = require('./commands/gif');
const news = require('./commands/news');
const recent = require('./commands/recent');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const setUser = require('./commands/setUser');

const commands = {
    "deleteuser": {
        usage: "",
        description: "Deletes your woogles username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "gif": {
        usage: "[user]",
        description: "Shares your (or a user's) recent game as a GIF",
        process: gif.process,
        interact: gif.interact
    },
    "news": {
        usage: "",
        description: "Displays the latest announcement",
        process: news.process,
        interact: news.interact
    },
    "recent": {
        usage: "[user]",
        description: "Shares your (or a user's) recent game",
        process: recent.process,
        interact: recent.interact
    },
    "privacy": {
        usage: "",
        description: "View privacy policy",
        process: privacy.process,
        reply: privacy.reply
    },
    "profile": {
        usage: "[username]",
        description: "Displays your (or a user's) profile",
        process: profile.process,
        interact: profile.interact
    },
    "puzzle": {
        usage: "",
        description: "Displays today's puzzle",
        process: puzzle.process,
        interact: puzzle.interact
    },
    "setuser": {
        usage: "<woogles name>",
        description: "Sets your woogles username",
        process: setUser.process,
        reply: setUser.reply
    }
};

module.exports = commands;
