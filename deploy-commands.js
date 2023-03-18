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
    { name: 'Top Rated', value: 'best' },
    { name: 'Antichess', value: 'antichess' },
    { name: 'Atomic', value: 'atomic' },
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bot', value: 'bot' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Chess960', value: 'chess960' },
    { name: 'Classical', value: 'classical' },
    { name: 'Crazyhouse', value: 'crazyhouse' },
    { name: 'Horde', value: 'horde' },
    { name: 'King of the Hill', value: 'kingOfTheHill' },
    { name: 'Racing Kings', value: 'racingKings' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Three-check', value: 'threeCheck' },
    { name: 'UltraBullet', value: 'ultraBullet' },
    { name: 'Computer', value: 'computer' }
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
const pieces = [
    { name: 'Default', value: 'cburnett' },
    { name: 'California', value: 'california' },
    { name: 'Cardinal', value: 'cardinal' },
    { name: 'Disguised', value: 'disguised' },
    { name: 'Gioco', value: 'gioco' },
    { name: 'Horsey', value: 'horsey' },
    { name: 'Letter', value: 'letter' },
    { name: 'Merida', value: 'merida' },
    { name: 'Pixel', value: 'pixel' },
    { name: 'Shapes', value: 'shapes' }
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
const themes = [
    { name: 'Blue', value: 'blue' },
    { name: 'Brown', value: 'brown' },
    { name: 'Green', value: 'green' },
    { name: 'IC', value: 'ic' },
    { name: 'Purple', value: 'purple' }
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
    new SlashCommandBuilder().setName('stop').setDescription("Stop Lichess Statbot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find a created, started, or finished arena").addStringOption(option => option.setName('mode').setDescription('Select a game mode').addChoices(...arenas)).addStringOption(option => option.setName('status').setDescription('Select an arena status').addChoices(...statuses)).addStringOption(option => option.setName('theme').setDescription('Select a board theme').addChoices(...themes)).addStringOption(option => option.setName('piece').setDescription('Select a piece set').addChoices(...pieces)),
    new SlashCommandBuilder().setName('blog').setDescription("Display recent blog entries"),
    new SlashCommandBuilder().setName('bots').setDescription("Display online bots with source code"),
    new SlashCommandBuilder().setName('broadcast').setDescription("Find an upcoming or recent broadcast created by lichess"),
    new SlashCommandBuilder().setName('coach').setDescription("Find a coach"),
    new SlashCommandBuilder().setName('community').setDescription("Display recent community (or user) blog entries").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your lichess username from the bot's database"),
    new SlashCommandBuilder().setName('eval').setDescription("Get the cached evaluation of a position, if available").addStringOption(option => option.setName('fen').setDescription('FEN (Forsyth-Edwards Notation)')).addStringOption(option => option.setName('theme').setDescription('Select a board theme').addChoices(...themes)).addStringOption(option => option.setName('piece').setDescription('Select a piece set').addChoices(...pieces)),
    new SlashCommandBuilder().setName('jerome').setDescription("Display Jerome Gambit news"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Display top-rated players").addStringOption(option => option.setName('mode').setDescription('Select a leaderboard').addChoices(...leaderboards)),
    new SlashCommandBuilder().setName('log').setDescription("Display recent changes"),
    new SlashCommandBuilder().setName('news').setDescription("Display recent news"),
    new SlashCommandBuilder().setName('playing').setDescription("Share your (or a user's) current game").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')).addStringOption(option => option.setName('theme').setDescription('Select a board theme').addChoices(...themes)).addStringOption(option => option.setName('piece').setDescription('Select a piece set').addChoices(...pieces)),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle").addStringOption(option => option.setName('theme').setDescription('Select a board theme').addChoices(...themes)).addStringOption(option => option.setName('piece').setDescription('Select a piece set').addChoices(...pieces)),
    new SlashCommandBuilder().setName('reddit').setDescription("Fetch hot r/chess posts"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Select your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your lichess username").addStringOption(option => option.setName('username').setDescription('Enter your lichess username').setRequired(true)),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition").addStringOption(option => option.setName('variant').setDescription('Select a chess variant').addChoices(...variants)),
    new SlashCommandBuilder().setName('streamers').setDescription("Display live streamers"),
    new SlashCommandBuilder().setName('team').setDescription("Search teams for a keyword").addStringOption(option => option.setName('text').setDescription('Search keywords').setRequired(true)),
    new SlashCommandBuilder().setName('timestamp').setDescription("Print discord magic timestamp").addIntegerOption(option => option.setName('year').setDescription('Year (1970-)').setMinValue(1970).setRequired(true)).addIntegerOption(option => option.setName('month').setDescription('Month (1-12)').setMinValue(1).setMaxValue(12).setRequired(true)).addIntegerOption(option => option.setName('day').setDescription('Day (1-31)').setMinValue(1).setMaxValue(31).setRequired(true)).addIntegerOption(option => option.setName('hour').setDescription('Hour (0-23)').setMinValue(0).setMaxValue(23).setRequired(true)).addIntegerOption(option => option.setName('minute').setDescription('Minute (0-59)').setMinValue(0).setMaxValue(59).setRequired(true)).addIntegerOption(option => option.setName('offset').setDescription('UTC offset between -12 and +14').setMinValue(-12).setMaxValue(14)),
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

