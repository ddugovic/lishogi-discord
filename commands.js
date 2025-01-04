// Include commands
const anagram = require('./commands/anagram');
const blog = require('./commands/blog');
const chat = require('./commands/chat');
const define = require('./commands/define');
const deleteUser = require('./commands/deleteUser');
const equity = require('./commands/equity');
const help = require('./commands/help');
const news = require('./commands/news');
const recent = require('./commands/recent');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const setUser = require('./commands/setUser');
const timestamp = require('./commands/timestamp');

const commands = {
    "anagram": {
        usage: "<lexicon> <alphagrams>",
        description: "Define anagrams of alphagrams from lexicon",
        process: anagram.process,
        interact: anagram.interact
    },
    "blog": {
        usage: "",
        description: "Display recent blog entries",
        process: blog.process,
        interact: blog.interact
    },
    "chat": {
        usage: "",
        description: "Display lobby chat",
        //process: chat.process,
        interact: chat.interact
    },
    "define": {
        usage: "<lexicon> <words>",
        description: "Define words from lexicon",
        process: define.process,
        interact: define.interact
    },
    "deleteuser": {
        usage: "",
        description: "Delete your woogles username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "equity": {
        usage: "<lexicon> <rack>",
        description: "Estimate rack equity",
        process: equity.process,
        interact: equity.interact
    },
    "help": {
        usage: "",
        description: "Display a list of available commands",
        process: help.process,
        reply: help.reply
    },
    "news": {
        usage: "",
        description: "Display the latest announcement",
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
    "recent": {
        usage: "[user] [fast]",
        description: "Share your (or a user's) recent games",
        process: recent.process,
        interact: recent.interact
    },
    "setuser": {
        usage: "<woogles name>",
        description: "Set your woogles username",
        process: setUser.process,
        reply: setUser.reply
    },
    "timestamp": {
        usage: "<year> <month> <day> <hour> [minute] [second]",
        description: "Print discord magic timestamp",
        process: timestamp.process,
        interact: timestamp.interact
    }
};

module.exports = commands;
