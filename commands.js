// Include commands
const deleteUser = require('./commands/deleteUser');
const leaderboard = require('./commands/leaderboard');
const news = require('./commands/news');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const setUser = require('./commands/setUser');
const streamers = require('./commands/streamers');
const setGameMode = require('./commands/setGameMode');
const titled = require('./commands/titled');

const commands = {
    "deleteuser": {
        usage: "",
        description: "Deletes your chess.com username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "leaderboard": {
        usage: "[game mode]",
        description: "Displays the leaderboard top player",
        process: leaderboard.process,
        interact: leaderboard.interact
    },
    "news": {
        usage: "",
        description: "Display recent news",
        process: news.process,
        interact: news.interact
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
    "streamers": {
        usage: "",
        description: "Displays live streamers",
        process: streamers.process,
        interact: streamers.interact
    },
    "setgamemode": {
        usage: "[game mode]",
        description: "Sets your favorite game (or puzzle) mode",
        process: setGameMode.process,
        reply: setGameMode.reply
    },
    "setuser": {
        usage: "<chess.com name>",
        description: "Sets your chess.com username",
        process: setUser.process,
        reply: setUser.reply
    },
    "titled": {
        usage: "<title>",
        description: "Displays a titled player ID",
        process: titled.process,
        interact: titled.interact
    }
};

module.exports = commands;
