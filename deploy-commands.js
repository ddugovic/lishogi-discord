const { PermissionFlagsBits } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

const guildCommands = [
    new SlashCommandBuilder().setName('stop').setDescription("Stop the bot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const leaderboards = [
    { name: 'Battle', value: 'battle' },
    { name: 'Blitz', value: 'live_blitz' },
    { name: 'Blitz960', value: 'live_blitz960' },
    { name: 'Bughouse', value: 'live_bughouse' },
    { name: 'Bullet', value: 'live_bullet' },
    { name: 'Crazyhouse', value: 'live_crazyhouse' },
    { name: 'Daily', value: 'daily' },
    { name: 'Daily960', value: 'daily960' },
    { name: 'King of the Hill', value: 'live_kingofthehill' },
    { name: 'Puzzle Rush', value: 'rush' },
    { name: 'Rapid', value: 'live_rapid' },
    { name: 'Tactics', value: 'tactics' },
    { name: 'Three-Check', value: 'live_threecheck' }
];
const titles = [
    { name: "Grandmaster", value: "GM" },
    { name: "Women's Grandmaster", value: "WGM" },
    { name: "International Master", value: "IM" },
    { name: "Women's International Master", value: "WIM" },
    { name: "FIDE Master", value: "FM" },
    { name: "Women's FIDE Master", value: "WFM" },
    { name: "National Master", value: "NM" },
    { name: "Women's National Master", value: "WNM" },
    { name: "Candidate Master", value: "CM" },
    { name: "Women's Candidate Master", value: "WCM" }
];

const commands = [
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your chess.com username from the bot's database"),
    new SlashCommandBuilder().setName('jerome').setDescription("Display Jerome Gambit news"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Display the leaderboard top player").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...leaderboards)),
    new SlashCommandBuilder().setName('news').setDescription("Display recent news"),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter chess.com player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('reddit').setDescription("Fetch hot r/chess posts"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Select your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your lichess username").addStringOption(option => option.setName('username').setDescription('Enter your lichess username').setRequired(true)),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition").addStringOption(option => option.setName('variant').setDescription('Select a chess variant').addChoices(...variants)),
    new SlashCommandBuilder().setName('streamers').setDescription("Display live streamers"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode')),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your chess.com username").addStringOption(option => option.setName('username').setDescription('Enter your chess.com username').setRequired(true)),
    new SlashCommandBuilder().setName('titled').setDescription("Display a title player ID").addStringOption(option => option.setName('title').setDescription('Chess title').setRequired(true).addChoices(...titles)),
    new SlashCommandBuilder().setName('help').setDescription("Display a list of available commands")
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

