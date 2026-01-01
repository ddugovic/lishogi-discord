const { PermissionFlagsBits } = require("discord-api-types/v10");
const { SlashCommandBuilder } = require("@discordjs/builders");

const arenas = [
    { name: "Annan shogi", value: "annanshogi" },
    { name: "Checkshogi", value: "checkshogi" },
    { name: "Chu shogi", value: "chushogi" },
    { name: "Correspondence", value: "correspondence" },
    { name: "Kyoto shogi", value: "kyotoshogi" },
    { name: "Minishogi", value: "minishogi" },
    { name: "Rapid", value: "rapid" },
    { name: "Real-time", value: "realTime" },
    { name: "Thematic", value: "thematic" }
];
const categories = [
    { name: "Players", value: "Players" },
    { name: "Proverbs", value: "Proverbs" },
    { name: "Strategies", value: "Strategies" },
    { name: "Terminology", value: "Terminology" }
];
const channels = [
    { name: "Standard", value: "standard" },
    { name: "Annan shogi", value: "annanshogi" },
    { name: "Checkshogi", value: "checkshogi" },
    { name: "Chu shogi", value: "chushogi" },
    { name: "Kyoto shogi", value: "kyotoshogi" },
    { name: "Minishogi", value: "minishogi" },
    { name: "Computer", value: "computer" }
];
const languages = [
    { name: "English", value: "en" },
    { name: "Japanese", value: "jp" }
];
const modes = [
    { name: "Annan shogi", value: "annanshogi" },
    { name: "Checkshogi", value: "checkshogi" },
    { name: "Chu shogi", value: "chushogi" },
    { name: "Kyoto shogi", value: "kyotoshogi" },
    { name: "Minishogi", value: "minishogi" },
    { name: "Puzzle", value: "puzzle" },
    { name: "Standard", value: "standard" }
];
const ratings = [
    { name: "Annan shogi", value: "Annanshogi" },
    { name: "Checkshogi", value: "checkshogi" },
    { name: "Chu shogi", value: "chushogi" },
    { name: "Correspondence", value: "correspondence" },
    { name: "Kyoto shogi", value: "kyotoshogi" },
    { name: "Minishogi", value: "minishogi" },
    { name: "Puzzle", value: "puzzle" },
    { name: "Standard", value: "standard" }
];
const statuses = [
    { name: "Featured", value: "featured" },
    { name: "Started", value: "started" },
    { name: "Finished", value: "finished" }
];
const systems = [
    { name: "Arena", value: "arena" },
    { name: "Organized", value: "organized" },
    { name: "Round-robin", value: "robin" }
];

const guildCommands = [
    new SlashCommandBuilder().setName("stop").setDescription("Stop Lishogi Statbot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const commands = [
    new SlashCommandBuilder().setName("arena").setDescription("Find a featured, started, or finished arena").addStringOption(option => option.setName("mode").setDescription("Select a game mode").addChoices(...arenas)).addStringOption(option => option.setName("status").setDescription("Select an arena status").addChoices(...statuses)).addStringOption(option => option.setName("system").setDescription("Select an arena system").addChoices(...systems)),
    new SlashCommandBuilder().setName("blog").setDescription("Display recent blog entries"),
    new SlashCommandBuilder().setName("bots").setDescription("Display online bots"),
    new SlashCommandBuilder().setName("broadcast").setDescription("Find an upcoming or recent broadcast created by lishogi"),
    new SlashCommandBuilder().setName("coach").setDescription("Find a coach"),
    new SlashCommandBuilder().setName("deleteuser").setDescription("Delete your lishogi username from the bot's database"),
    new SlashCommandBuilder().setName("eval").setDescription("Get the cached evaluation of a position, if available").addStringOption(option => option.setName("sfen").setDescription("SFEN (Shogi Forsyth-Edwards Notation)").setRequired(true)),
    new SlashCommandBuilder().setName("leaderboard").setDescription("Display top-rated players").addStringOption(option => option.setName("mode").setDescription("Select a game mode").addChoices(...modes)),
    new SlashCommandBuilder().setName("playing").setDescription("Share your (or a user's) current game").addStringOption(option => option.setName("username").setDescription("Enter lishogi player username").setAutocomplete(true).setMaxLength(30).setMinLength(2)),
    new SlashCommandBuilder().setName("news").setDescription("Display recent news"),
    new SlashCommandBuilder().setName("privacy").setDescription("View privacy policy"),
    new SlashCommandBuilder().setName("profile").setDescription("Display your (or a user's) profile").addStringOption(option => option.setName("username").setDescription("Enter lishogi player username").setAutocomplete(true).setMaxLength(30).setMinLength(2)),
    new SlashCommandBuilder().setName("puzzle").setDescription("Display daily puzzle"),
    new SlashCommandBuilder().setName("schedule").setDescription("Schedule event (tournament) game (see timestamp command)").addStringOption(option => option.setName("event").setDescription("Event (tournament) name").setRequired(true)).addUserOption(option => option.setName("sente").setDescription("Sente (first player)").setRequired(true)).addUserOption(option => option.setName("gote").setDescription("Gote (second player)").setRequired(true)).addIntegerOption(option => option.setName("year").setDescription("Year (2000-2100)").setMinValue(2000).setMaxValue(2100).setRequired(true)).addIntegerOption(option => option.setName("month").setDescription("Month (1-12)").setMinValue(1).setMaxValue(12).setRequired(true)).addIntegerOption(option => option.setName("day").setDescription("Day (1-31)").setMinValue(1).setMaxValue(31).setRequired(true)).addIntegerOption(option => option.setName("utc_hour").setDescription("UTC hour (0-23)").setMinValue(0).setMaxValue(23).setRequired(true)).addIntegerOption(option => option.setName("minute").setDescription("Minute (0-59)").setMinValue(0).setMaxValue(59).setRequired(true)),
    new SlashCommandBuilder().setName("setgamemode").setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName("mode").setDescription("Enter your favorite game (or puzzle) mode").addChoices(...ratings)),
    new SlashCommandBuilder().setName("setuser").setDescription("Set your lishogi username").addStringOption(option => option.setName("username").setDescription("Enter your lishogi username").setAutocomplete(true).setMaxLength(30).setMinLength(2).setRequired(true)),
    new SlashCommandBuilder().setName("simul").setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition"),
    new SlashCommandBuilder().setName("streamers").setDescription("Display live streamers").addStringOption(option => option.setName("lang").setDescription("Language").addChoices(...languages)),
    new SlashCommandBuilder().setName("team").setDescription("Search teams for a keyword").addStringOption(option => option.setName("text").setDescription("Search keywords").setRequired(true)),
    new SlashCommandBuilder().setName("timestamp").setDescription("Print discord magic timestamp").addIntegerOption(option => option.setName("year").setDescription("Year (2000-2100)").setMinValue(2000).setMaxValue(2100).setRequired(true)).addIntegerOption(option => option.setName("month").setDescription("Month (1-12)").setMinValue(1).setMaxValue(12).setRequired(true)).addIntegerOption(option => option.setName("day").setDescription("Day (1-31)").setMinValue(1).setMaxValue(31).setRequired(true)).addIntegerOption(option => option.setName("utc_hour").setDescription("UTC hour (0-23)").setMinValue(0).setMaxValue(23).setRequired(true)).addIntegerOption(option => option.setName("minute").setDescription("Minute (0-59)").setMinValue(0).setMaxValue(59).setRequired(true)),
    new SlashCommandBuilder().setName("tv").setDescription("Display TV game list").addStringOption(option => option.setName("mode").setDescription("Select channel").addChoices(...channels)),
    new SlashCommandBuilder().setName("video").setDescription("Search videos for a keyword").addStringOption(option => option.setName("text").setDescription("Search keywords")),
    new SlashCommandBuilder().setName("wiki").setDescription("Display Shogi Harbour wiki pages").addStringOption(option => option.setName("category").setDescription("Category").setRequired(true).addChoices(...categories)),
    new SlashCommandBuilder().setName("help").setDescription("Display a list of available commands")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages).toJSON());

const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: guildCommands })
    .then(() => console.log(`Successfully registered ${guildCommands.length} application guild slash commands for client ${config.clientId}.`))
    .catch(console.error);

rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} application slash commands for client ${config.clientId}.`))
    .catch(console.error);
/*
fetch(`https://discordbotlist.com/api/v1/bots/${config.clientId}/commands`, { method: 'post', body: commands, headers: { Accept: 'application/json', Authorization: config.discordbotlisttoken } })
    .then(response => response.json())
    .then(json => console.log(json));
*/
