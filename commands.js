// Include commands
const anagram = require('./commands/anagram');
const define = require('./commands/define');
const deleteUser = require('./commands/deleteUser');
const news = require('./commands/news');
const recent = require('./commands/recent');
const privacy = require('./commands/privacy');
const profile = require('./commands/profile');
const puzzle = require('./commands/puzzle');
const setUser = require('./commands/setUser');

const commands = {
    "anagram": {
        usage: "<lexicon> <alphagrams>",
        description: "Define anagrams of alphagrams from lexicon",
        process: anagram.process,
        interact: anagram.interact
    },
    "define": {
        usage: "<lexicon> <words>",
        description: "Define words from lexicon",
        process: define.process,
        interact: define.interact
    },
    "deleteuser": {
        usage: "",
        description: "Deletes your woogles username from the bot's database",
        process: deleteUser.process,
        reply: deleteUser.reply
    },
    "news": {
        usage: "",
        description: "Displays the latest announcement",
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
    "recent": {
        usage: "[user]",
        description: "Shares your (or a user's) recent games",
        process: recent.process,
        interact: recent.interact
    },
    "setuser": {
        usage: "<woogles name>",
        description: "Sets your woogles username",
        process: setUser.process,
        reply: setUser.reply
    }
};

module.exports = commands;
