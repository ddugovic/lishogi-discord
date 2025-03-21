// Include commands
const arena = require('./commands/arena');
const autocomplete = require('./commands/autocomplete');
const blog = require('./commands/blog');
const bots = require('./commands/bots');
const broadcast = require('./commands/broadcast');
const coach = require('./commands/coach');
const deleteUser = require('./commands/deleteUser');
const eval = require('./commands/eval');
const help = require('./commands/help');
const leaderboard = require('./commands/leaderboard');
const news = require('./commands/news');
const setUser = require('./commands/setUser');
const playing = require('./commands/playing');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const schedule = require('./commands/schedule');
const setGameMode = require('./commands/setGameMode');
const simul = require('./commands/simul');
const streamers = require('./commands/streamers');
const team = require('./commands/team');
const timestamp = require('./commands/timestamp');
const tv = require('./commands/tv');
const video = require('./commands/video');
const wiki = require('./commands/wiki');

const commands = {
    "arena": {
        usage: "[game mode]",
        description: "Find a created, started, or finished arena",
        process: arena.process,
        interact: arena.interact
    },
    "autocomplete": {
        usage: "<lishogi name>",
        description: "Automatically complete lishogi username",
        process: autocomplete.process,
        interact: autocomplete.interact
    },
    "blog": {
        usage: "",
        description: "Display recent blog entries",
        process: blog.process,
        interact: blog.interact
    },
    "bots": {
        usage: "",
        description: "Display online bots",
        process: bots.process,
        interact: bots.interact
    },
    "broadcast": {
        usage: "",
        description: "Find an upcoming or recent broadcast created by lishogi",
        process: broadcast.process,
        interact: broadcast.interact
    },
    "coach": {
        usage: "",
        description: "Find a coach",
        process: coach.process,
        interact: coach.interact
    },
    "deleteuser": {
        usage: "",
        description: "Delete your lishogi username from the bot's database",
        process: deleteUser.process,
        interact: deleteUser.interact
    },
    "eval": {
        usage: "<fen>",
        description: "Get the cached evaluation of a position, if available",
        process: eval.process,
        interact: eval.interact
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
    "news": {
        usage: "",
        description: "Display recent news",
        process: news.process,
        interact: news.interact
    },
    "playing": {
        usage: "[user]",
        description: "Share your (or a user's) current game",
        process: playing.process,
        interact: playing.interact
    },
    "privacy": {
        usage: "",
        description: "View privacy policy",
        process: privacy.process,
        interact: privacy.interact
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
        interact: puzzle.interact
    },
    "schedule": {
        usage: "<event> <sente> <gote> <year> <month> <day> <hour> <minute>",
        description: "Schedule event (tournament) game",
        process: schedule.process,
        reply: schedule.reply
    },
    "setgamemode": {
        usage: "[game mode]",
        description: "Set your favorite game (or puzzle) mode",
        process: setGameMode.process,
        interact: setGameMode.interact
    },
    "setuser": {
        usage: "<lishogi name>",
        description: "Set your lishogi username",
        process: setUser.process,
        interact: setUser.interact
    },
    "simul": {
        usage: "",
        description: "Display a recently finished, ongoing, or upcoming simultanous exhibition",
        process: simul.process,
        interact: simul.interact
    },
    "streamers": {
        usage: "[lang]",
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
    "timestamp": {
        usage: "<year> <month> <day> <hour> <minute>",
        description: "Print discord magic timestamp",
        process: timestamp.process,
        interact: timestamp.interact
    },
    "tv": {
        usage: "[channel]",
        description: "Display TV game list",
        process: tv.process,
        interact: tv.interact
    },
    "video": {
        usage: "[text]",
        description: "Search videos for a keyword",
        process: video.process,
        interact: video.interact
    },
    "wiki": {
        usage: "[category]",
        description: "Display Shogi Harbour wiki pages",
        process: wiki.process,
        interact: wiki.interact
    }
};

module.exports = commands;
