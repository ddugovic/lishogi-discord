// Include commands
const arena = require('./commands/arena');
const blog = require('./commands/blog');
const bots = require('./commands/bots');
const broadcast = require('./commands/broadcast');
const coach = require('./commands/coach');
const deleteUser = require('./commands/deleteUser');
const eval = require('./commands/eval');
const leaderboard = require('./commands/leaderboard');
const news = require('./commands/news');
const setUser = require('./commands/setUser');
const playing = require('./commands/playing');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const reddit = require('./commands/reddit');
const setGameMode = require('./commands/setGameMode');
const simul = require('./commands/simul');
const streamers = require('./commands/streamers');
const team = require('./commands/team');
const tv = require('./commands/tv');
const video = require('./commands/video');

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
    "bots": {
        usage: "",
        description: "Display online bots",
        process: bots.process,
        interact: bots.interact
    },
    "broadcast": {
        usage: "",
        description: "Display an incoming, ongoing, or finished official broadcast",
        process: broadcast.process,
        interact: broadcast.interact
    },
    "coach": {
        usage: "",
        description: "Find a coach",
        process: coach.process,
        reply: coach.reply
    },
    "deleteuser": {
        usage: "",
        description: "Delete your lishogi username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "eval": {
        usage: "<fen>",
        description: "Get the cached evaluation of a position, if available",
        process: eval.process,
        reply: eval.reply
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
        description: "Display your (or a user's) profile",
        process: profile.process,
        reply: profile.reply
    },
    "puzzle": {
        usage: "",
        description: "Display today's puzzle",
        process: puzzle.process,
        reply: puzzle.reply
    },
    "reddit": {
        usage: "",
        description: "Fetch reddit image",
        process: reddit.process,
        interact: reddit.interact
    },
    "setgamemode": {
        usage: "[game mode]",
        description: "Set your favorite game (or puzzle) mode",
        process: setGameMode.process,
        reply: setGameMode.reply
    },
    "setuser": {
        usage: "<lishogi name>",
        description: "Set your lishogi username",
        process: setUser.process,
        reply: setUser.reply
    },
    "simul": {
        usage: "",
        description: "Display a recently finished, ongoing, or upcoming simultanous exhibition",
        process: simul.process,
        interact: simul.interact
    },
    "streamers": {
        usage: "",
        description: "Display live streamers",
        process: streamers.process,
        reply: streamers.reply
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
    },
    "video": {
        usage: "[text]",
        description: "Search videos for a keyword",
        process: video.process,
        interact: video.interact
    }
};

module.exports = commands;
