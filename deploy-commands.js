const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
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
const commands = [
    new SlashCommandBuilder().setName('deleteuser').setDescription("Deletes your chess.com username from the bot's database"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Displays the leaderboard top player").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...leaderboards)),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Displays your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter chess.com player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Displays today's puzzle"),
    new SlashCommandBuilder().setName('streamers').setDescription("Displays live streamers"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Sets your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode')),
    new SlashCommandBuilder().setName('setuser').setDescription("Sets your chess.com username").addStringOption(option => option.setName('username').setDescription('Enter your chess.com username')),
    new SlashCommandBuilder().setName('help').setDescription("Sends a list of available commands")
]
    .map(command => command.toJSON());

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} application guild slash commands for client ${config.clientId} in guild ${config.guildId}.`))
    .catch(console.error);

rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} application slash commands for client ${config.clientId}.`))
    .catch(console.error);

