// Include commands
const arena = require('./commands/arena');
const blog = require('./commands/blog');
const broadcast = require('./commands/broadcast');
const deleteUser = require('./commands/deleteUser');
const help = require('./commands/help');
const leaderboard = require('./commands/leaderboard');
const setUser = require('./commands/setUser');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const setGameMode = require('./commands/setGameMode');
const simul = require('./commands/simul');
const streamers = require('./commands/streamers');
const team = require('./commands/team');
const tv = require('./commands/tv');

const commands = {
    "arena": {
        usage: "[game mode]",
        description: "Find an upcoming or recent arena",
        process: arena.process,
        interact: arena.interact
    },
    "blog": {
        usage: "",
        description: "Display recent blog entries",
        process: blog.process,
        interact: blog.interact
    },
    "broadcast": {
        usage: "",
        description: "Find an upcoming or recent broadcast created by lidraughts",
        process: broadcast.process,
        reply: broadcast.reply
    },
    "deleteuser": {
        usage: "",
        description: "Delete your lidraughts username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "help": {
        usage: "",
        description: "Display a list of available commands",
        process: help.process,
        reply: help.reply
    },
    "leaderboard": {
        usage: "[game mode]",
        description: "Display top-rated players",
        process: leaderboard.process,
        interact: leaderboard.interact
    },
    "privacy": {
        usage: "",
        description: "View privacy policy",
        process: privacy.process,
        reply: privacy.reply
    },
    "profile": {
        usage: "[username]",
        description: "Display your (or a user's) profile",
        process: profile.process,
        interact: profile.interact
    },
    "puzzle": {
        usage: "",
        description: "Display today's puzzle",
        process: puzzle.process,
        reply: puzzle.reply
    },
    "setgamemode": {
        usage: "[game mode]",
        description: "Set your favorite game (or puzzle) mode",
        process: setGameMode.process,
        reply: setGameMode.reply
    },
    "setuser": {
        usage: "<lidraughts name>",
        description: "Set your lidraughts username",
        process: setUser.process,
        reply: setUser.reply
    },
    "simul": {
        usage: "",
        description: "Display a recently finished, ongoing, or upcoming simultanous exhibition",
        process: simul.process,
        reply: simul.reply
    },
    "streamers": {
        usage: "",
        description: "Display live streamers",
        process: streamers.process,
        interact: streamers.interact
    },
    "team": {
        usage: "<text>",
        description: "Search teams for a keyword",
        process: team.process,
        interact: team.interact
    },
    "tv": {
        usage: "[game mode]",
        description: "Share the featured game",
        process: tv.process,
        reply: tv.reply
    }
};

module.exports = commands;
