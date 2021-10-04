// Include commands
const arena = require('./commands/arena');
const broadcast = require('./commands/broadcast');
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
        description: "Find an upcoming or recent arena created by lichess (or a user)",
        process: arena
    },
    "broadcast": {
        usage: "",
        description: "Find an incoming, ongoing, or finished official broadcast",
        process: broadcast
    },
    "deleteuser": {
        usage: "",
        description: "Deletes your lichess username from the bot's database",
        process: deleteUser
    },
    "playing": {
        usage: "[user]",
        description: "Shares your (or a user's) ongoing game",
        process: playing
    },
    "profile": {
        usage: "[username]",
        description: "Displays your (or a user's) profile",
        process: profile
    },
    "puzzle": {
        usage: "",
        description: "Displays today's puzzle",
        process: puzzle
    },
    "recent": {
        usage: "[rated/casual]",
        description: "Shares your most recent game",
        process: recent
    },
    "setgamemode": {
        usage: "[game mode]",
        description: "Sets your favorite game (or puzzle) mode",
        process: setGameMode
    },
    "setuser": {
        usage: "<lichess name>",
        description: "Sets your lichess username",
        process: setUser
    },
    "tv": {
        usage: "[game mode]",
        description: "Shares the featured game",
        process: tv
    },
    "whoami": {
        usage: "",
        description: "Returns your lichess username",
        process: whoAmI
    },
    "privacy": {
        usage: "",
        description: "View privacy policy",
        process: privacy
    },
};

module.exports = commands;
