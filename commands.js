// Include commands
const deleteUser = require('./commands/deleteUser');
const news = require('./commands/news');
const playing = require('./commands/playing');
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
    "news": {
        usage: "",
        description: "Displays the latest announcement",
        process: news.process,
        reply: news.reply
    },
    "playing": {
        usage: "[user]",
        description: "Shares your (or a user's) current game URL",
        process: playing.process,
        reply: playing.reply
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
        reply: profile.reply
    },
    "puzzle": {
        usage: "",
        description: "Displays today's puzzle",
        process: puzzle.process,
        reply: puzzle.reply
    },
    "setuser": {
        usage: "<woogles name>",
        description: "Sets your woogles username",
        process: setUser.process,
        reply: setUser.reply
    }
};

module.exports = commands;
