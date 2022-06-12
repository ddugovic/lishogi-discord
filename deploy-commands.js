const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const modes = [
    { name: 'Antichess', value: 'antichess' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find an upcoming or recent arena").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('broadcast').setDescription("Find an upcoming or recent broadcast created by lichess"),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Deletes your lichess username from the bot's database"),
    new SlashCommandBuilder().setName('eval').setDescription("Get the cached evaluation of a position, if available").addStringOption(option => option.setName('fen').setDescription('FEN (Forsyth-Edwards Notation)')),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Displays the leaderboard top player").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('playing').setDescription("Shares your (or a user's) current game URL").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('gif').setDescription("Shares your (or a user's) current game as a GIF").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Displays your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Displays today's puzzle"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Sets your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('setuser').setDescription("Sets your lichess username").addStringOption(option => option.setName('username').setDescription('Enter your lichess username')),
    new SlashCommandBuilder().setName('tv').setDescription("Shares the featured game").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode').addChoices(...modes)),
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

