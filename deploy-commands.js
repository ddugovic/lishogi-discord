const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const channels = [
    { name: 'Top Rated', value: 'Top Rated' },
    { name: 'All Chess', value: 'All Chess' },
    { name: 'All Draughts', value: 'All Draughts' },
    { name: 'All Shogi', value: 'All Shogi' },
    { name: 'All Xiangqi', value: 'All Xiangqi' },
    { name: 'Computer', value: 'Computer' }
];
const modes = [
    { name: 'Antichess', value: 'antichess' },
    { name: 'Antidraughts', value: 'antidraughts' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Brazilian', value: 'brazilian' },
    { name: 'Breakthrough', value: 'breakthrough' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'Five-check', value: 'fiveCheck' },
    { name: 'Frisian', value: 'frisian' },
    { name: 'Frysk!', value: 'frysk' },
    { name: 'Horde', value: 'Horde' },
    { name: 'Mini Shogi', value: 'minishogi' },
    { name: 'Mini Xiangqi', value: 'minixiangqi' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Othello', value: 'othello' },
    { name: 'Oware', value: 'oware' },
    { name: 'Pool', value: 'pool' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Russian', value: 'russian' },
    { name: 'Shogi', value: 'shogi' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' },
    { name: 'Xiangqi', value: 'xiangqi' }
];
// PlayStrategy does not have puzzle ratings yet
const ratings = modes;
const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find an upcoming or recent arena").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Deletes your playstrategy username from the bot's database"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Displays the leaderboard top player").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('playing').setDescription("Shares your (or a user's) current game URL").addStringOption(option => option.setName('username').setDescription('Enter playstrategy player username')),
    new SlashCommandBuilder().setName('gif').setDescription("Shares your (or a user's) current game as a GIF").addStringOption(option => option.setName('username').setDescription('Enter playstrategy player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Displays your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter playstrategy player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Displays today's puzzle"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Sets your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Sets your playstrategy username").addStringOption(option => option.setName('username').setDescription('Enter your playstrategy username')),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition"),
    new SlashCommandBuilder().setName('streamers').setDescription("Displays live streamers"),
    new SlashCommandBuilder().setName('tv').setDescription("Shares the featured game").addStringOption(option => option.setName('mode').setDescription('Enter a game mode').addChoices(...channels)),
    new SlashCommandBuilder().setName('help').setDescription("Sends a list of available commands")
]
    .map(command => command.toJSON());

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} application guild slash commands for client ${config.clientId} in guild ${config.guildId}.`))
    .catch(console.error);

rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} application slash commands for client ${config.clientId}.`))
    .catch(console.error);

