const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const channels = [
    { name: 'Top Rated', value: 'Top Rated' },
    { name: 'Antidraughts', value: 'Antidraughts' },
    { name: 'Blitz', value: 'Blitz' },
    { name: 'Brazilian', value: 'Brazilian' },
    { name: 'Breakthrough', value: 'Breakthrough' },
    { name: 'Bullet', value: 'Bullet' },
    { name: 'Classical', value: 'Classical' },
    { name: 'Frisian', value: 'Frisian' },
    { name: 'Frysk!', value: 'Frysk!' },
    { name: 'Rapid', value: 'Rapid' },
    { name: 'Russian', value: 'Russian' },
    { name: 'UltraBullet', value: 'UltraBullet' },
    { name: 'Computer', value: 'Computer' }
];
const modes = [
    { name: 'Antidraughts', value: 'antidraughts' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Brazilian', value: 'brazilian' },
    { name: 'Breakthrough', value: 'breakthrough' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Classical', value: 'classical' },
    { name: 'Frisian', value: 'frisian' },
    { name: 'Frysk!', value: 'frysk' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Russian', value: 'russian' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const ratings = [
    { name: 'Antidraughts', value: 'antidraughts' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Brazilian', value: 'brazilian' },
    { name: 'Breakthrough', value: 'breakthrough' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Classical', value: 'classical' },
    { name: 'Frisian', value: 'frisian' },
    { name: 'Frysk!', value: 'frysk' },
    { name: 'Puzzle', value: 'puzzle' },
    { name: 'Puzzle (Frisian)', value: 'puzzlefrisian' },
    { name: 'Puzzle (Russian)', value: 'puzzlerussian' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Russian', value: 'russian' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find an upcoming or recent arena").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your lidraughts username from the bot's database"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Display the leaderboard top player").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('playing').setDescription("Share your (or a user's) current game URL").addStringOption(option => option.setName('username').setDescription('Enter lidraughts player username')),
    new SlashCommandBuilder().setName('gif').setDescription("Share your (or a user's) current game as a GIF").addStringOption(option => option.setName('username').setDescription('Enter lidraughts player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter lidraughts player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your lidraughts username").addStringOption(option => option.setName('username').setDescription('Enter your lidraughts username')),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition"),
    new SlashCommandBuilder().setName('streamers').setDescription("Display live streamers"),
    new SlashCommandBuilder().setName('tv').setDescription("Share the featured game").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...channels)),
    new SlashCommandBuilder().setName('help').setDescription("Send a list of available commands")
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

