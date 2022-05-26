// Include commands
const arena = require('./commands/arena');
const deleteUser = require('./commands/deleteUser');
const gif = require('./commands/gif');
const leaderboard = require('./commands/leaderboard');
const setUser = require('./commands/setUser');
const playing = require('./commands/playing');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const setGameMode = require('./commands/setGameMode');
const tv = require('./commands/tv');
const whoAmI = require('./commands/whoAmI');

const commands = {
    "arena": {
        usage: "[game mode]",
        description: "Find an upcoming or recent arena",
        process: arena.process,
        reply: arena.reply
    },
    "deleteuser": {
        usage: "",
        description: "Deletes your playstrategy username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "leaderboard": {
        usage: "[game mode]",
        description: "Displays the leaderboard top player",
        process: leaderboard.process,
        reply: leaderboard.reply
    },
    "playing": {
        usage: "[user]",
        description: "Shares your (or a user's) current game URL",
        process: playing.process,
        reply: playing.reply
    },
    "gif": {
        usage: "[user]",
        description: "Shares your (or a user's) current game as a GIF",
        process: gif.process,
        reply: gif.reply
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
    "setgamemode": {
        usage: "[game mode]",
        description: "Sets your favorite game (or puzzle) mode",
        process: setGameMode.process,
        reply: setGameMode.reply
    },
    "setuser": {
        usage: "<playstrategy name>",
        description: "Sets your playstrategy username",
        process: setUser.process,
        reply: setUser.reply
    },
    "tv": {
        usage: "[game mode]",
        description: "Shares the featured game",
        process: tv.process,
        reply: tv.reply
    },
    "whoami": {
        usage: "",
        description: "Returns your playstrategy username",
        process: whoAmI.process,
        reply: whoAmI.reply
    }
};

module.exports = commands;
