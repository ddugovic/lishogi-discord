// Include commands
const arena = require('./commands/arena');
const blog = require('./commands/blog');
const bots = require('./commands/bots');
const broadcast = require('./commands/broadcast');
const coach = require('./commands/coach');
const community = require('./commands/community');
const deleteUser = require('./commands/deleteUser');
const eval = require('./commands/eval');
const leaderboard = require('./commands/leaderboard');
const log = require('./commands/log');
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
        description: "Display online bots with source code",
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
        interact: coach.interact
    },
    "community": {
        usage: "",
        description: "Display recent community blog entries",
        process: community.process,
        interact: community.interact
    },
    "deleteuser": {
        usage: "",
        description: "Delete your lichess username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "eval": {
        usage: "[fen]",
        description: "Get the cached evaluation of a position, if available",
        process: eval.process,
        interact: eval.interact
    },
    "leaderboard": {
        usage: "[game mode]",
        description: "Display top-rated players",
        process: leaderboard.process,
        interact: leaderboard.interact
    },
    "log": {
        usage: "",
        description: "Display recent changes",
        process: log.process,
        interact: log.interact
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
        interact: puzzle.interact
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
        usage: "<lichess name>",
        description: "Set your lichess username",
        process: setUser.process,
        reply: setUser.reply
    },
    "simul": {
        usage: "[variant]",
        description: "Display a recently finished, ongoing, or upcoming simultanous exhibition",
        process: simul.process,
        interact: simul.interact
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
        usage: "[channel]",
        description: "Share the featured game",
        process: tv.process,
        interact: tv.interact
    },
    "video": {
        usage: "[text]",
        description: "Search videos for a keyword",
        process: video.process,
        interact: video.interact
    }
};

module.exports = commands;
