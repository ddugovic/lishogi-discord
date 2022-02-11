// Include commands
const arena = require('./commands/arena');
const deleteUser = require('./commands/deleteUser');
const setUser = require('./commands/setUser');
const playing = require('./commands/playing');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const recent = require('./commands/recent');
const setGameMode = require('./commands/setGameMode');
const tv = require('./commands/tv');
const whoAmI = require('./commands/whoAmI');

const commands = {
    "arena": {
        usage: "[user]",
        description: "Find an upcoming or recent arena created by lishogi (or a user)",
        process: arena.process,
        reply: arena.reply
    },
    "deleteuser": {
        usage: "",
        description: "Deletes your lishogi username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "playing": {
        usage: "[user]",
        description: "Shares your (or a user's) ongoing game",
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
    "recent": {
        usage: "[rated/casual]",
        description: "Shares your most recent game",
        process: recent.process,
        reply: recent.reply
    },
    "setgamemode": {
        usage: "[game mode]",
        description: "Sets your favorite game (or puzzle) mode",
        process: setGameMode.process,
        reply: setGameMode.reply
    },
    "setuser": {
        usage: "<lishogi name>",
        description: "Sets your lishogi username",
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
        description: "Returns your lishogi username",
        process: whoAmI.process,
        reply: whoAmI.reply
    }
};

module.exports = commands;
