const { PermissionFlagsBits } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

const arenas = [
    { name: 'Antichess', value: 'antichess' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'Horde', value: 'Horde' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Thematic', value: 'thematic' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const channels = [
    { name: 'Top Rated', value: 'Top Rated' },
    { name: 'Antichess', value: 'Antichess' },
    { name: 'Atomic', value: 'Atomic' },
    { name: 'Blitz', value: 'Blitz' },
    { name: 'Bot', value: 'Bot' },
    { name: 'Bullet', value: 'Bullet' },
    { name: 'Chess960', value: 'Chess960' },
    { name: 'Classical', value: 'Classical' },
    { name: 'Crazyhouse', value: 'Crazyhouse' },
    { name: 'Horde', value: 'Horde' },
    { name: 'King of the Hill', value: 'King of the Hill' },
    { name: 'Racing Kings', value: 'Racing Kings' },
    { name: 'Rapid', value: 'Rapid' },
    { name: 'Three-check', value: 'Three-check' },
    { name: 'UltraBullet', value: 'UltraBullet' },
    { name: 'Computer', value: 'Computer' }
];
const leaderboards = [
    { name: 'Antichess', value: 'antichess' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'Horde', value: 'Horde' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const ratings = [
    { name: 'Antichess', value: 'antichess' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'Horde', value: 'Horde' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Puzzle', value: 'puzzle' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const variants = [
    { name: 'Antichess', value: 'antichess' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'Horde', value: 'Horde' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Thematic', value: 'thematic' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const statuses = [
    { name: 'Created', value: 'created' },
    { name: 'Started', value: 'started' },
    { name: 'Finished', value: 'finished' }
];

const guildCommands = [
    new SlashCommandBuilder().setName('stop').setDescription("Stop the bot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find a created, started, or finished arena").addStringOption(option => option.setName('mode').setDescription('Select a game mode').addChoices(...arenas)).addStringOption(option => option.setName('status').setDescription('Select an arena status').addChoices(...statuses)),
    new SlashCommandBuilder().setName('blog').setDescription("Display recent blog entries"),
    new SlashCommandBuilder().setName('bots').setDescription("Display online bots with source code"),
    new SlashCommandBuilder().setName('broadcast').setDescription("Find an upcoming or recent broadcast created by lichess"),
    new SlashCommandBuilder().setName('coach').setDescription("Find a coach"),
    new SlashCommandBuilder().setName('community').setDescription("Display recent community blog entries"),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your lichess username from the bot's database"),
    new SlashCommandBuilder().setName('eval').setDescription("Get the cached evaluation of a position, if available").addStringOption(option => option.setName('fen').setDescription('FEN (Forsyth-Edwards Notation)')),
    new SlashCommandBuilder().setName('jerome').setDescription("Display Jerome Gambit news"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Display top-rated players").addStringOption(option => option.setName('mode').setDescription('Select a leaderboard').addChoices(...leaderboards)),
    new SlashCommandBuilder().setName('log').setDescription("Display recent changes"),
    new SlashCommandBuilder().setName('news').setDescription("Display recent news"),
    new SlashCommandBuilder().setName('playing').setDescription("Share your (or a user's) current game").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('reddit').setDescription("Fetch r/chess image"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Select your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your lichess username").addStringOption(option => option.setName('username').setDescription('Enter your lichess username').setRequired(true)),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition").addStringOption(option => option.setName('variant').setDescription('Select a chess variant').addChoices(...variants)),
    new SlashCommandBuilder().setName('streamers').setDescription("Display live streamers"),
    new SlashCommandBuilder().setName('team').setDescription("Search teams for a keyword").addStringOption(option => option.setName('text').setDescription('Search keywords').setRequired(true)),
    new SlashCommandBuilder().setName('tv').setDescription("Share the featured game").addStringOption(option => option.setName('mode').setDescription('Select a channel').addChoices(...channels)),
    new SlashCommandBuilder().setName('video').setDescription("Search videos for a keyword").addStringOption(option => option.setName('text').setDescription('Search keywords')),
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

