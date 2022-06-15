// Include commands
const deleteUser = require('./commands/deleteUser');
const leaderboard = require('./commands/leaderboard');
const setUser = require('./commands/setUser');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
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
        reply: leaderboard.reply
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
    "streamers": {
        usage: "",
        description: "Displays live streamers",
        process: streamers.process,
        reply: streamers.reply
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
        reply: titled.reply
    }
};

module.exports = commands;
