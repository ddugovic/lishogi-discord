const { PermissionFlagsBits } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

const arenas = [
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Classical', value: 'classical' },
    { name: 'Minishogi', value: 'minishogi' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'Thematic', value: 'thematic' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const channels = [
    { name: 'Top Rated', value: 'Top Rated' },
    { name: 'Blitz', value: 'Blitz' },
    { name: 'Bullet', value: 'Bullet' },
    { name: 'Classical', value: 'Classical' },
    { name: 'Minishogi', value: 'Minishogi' },
    { name: 'Rapid', value: 'Rapid' },
    { name: 'UltraBullet', value: 'UltraBullet' },
    { name: 'Computer', value: 'Computer' }
];
const hours = [
    { name: '0 Midnight', value: '0' },
    { name: '1 AM', value: '1' },
    { name: '2 AM', value: '2' },
    { name: '3 AM', value: '3' },
    { name: '4 AM', value: '4' },
    { name: '5 AM', value: '5' },
    { name: '6 AM', value: '6' },
    { name: '7 AM', value: '7' },
    { name: '8 AM', value: '8' },
    { name: '9 AM', value: '9' },
    { name: '10 AM', value: '10' },
    { name: '11 AM', value: '11' },
    { name: '12 Noon', value: '12' },
    { name: '1 PM', value: '13' },
    { name: '2 PM', value: '14' },
    { name: '3 PM', value: '15' },
    { name: '4 PM', value: '16' },
    { name: '5 PM', value: '17' },
    { name: '6 PM', value: '18' },
    { name: '7 PM', value: '19' },
    { name: '8 PM', value: '20' },
    { name: '9 PM', value: '21' },
    { name: '10 PM', value: '22' },
    { name: '11 PM', value: '23' },
];
const minutes = [
    { name: '00', value: '0' },
    { name: '05', value: '5' },
    { name: '10', value: '10' },
    { name: '15', value: '15' },
    { name: '20', value: '20' },
    { name: '25', value: '25' },
    { name: '30', value: '30' },
    { name: '35', value: '35' },
    { name: '40', value: '40' },
    { name: '45', value: '45' },
    { name: '50', value: '50' },
    { name: '55', value: '55' },
];
const modes = [
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Classical', value: 'classical' },
    { name: 'Minishogi', value: 'minishogi' },
    { name: 'Puzzle', value: 'puzzle' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const ratings = [
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Classical', value: 'classical' },
    { name: 'Correspondence', value: 'correspondence' },
    { name: 'Minishogi', value: 'minishogi' },
    { name: 'Puzzle', value: 'puzzle' },
    { name: 'Rapid', value: 'rapid' },
    { name: 'UltraBullet', value: 'ultraBullet' }
];
const statuses = [
    { name: 'Created', value: 'created' },
    { name: 'Started', value: 'started' },
    { name: 'Finished', value: 'finished' }
];

const guildCommands = [
    new SlashCommandBuilder().setName('stop').setDescription("Stop Lishogi Statbot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find a created, started, or finished arena").addStringOption(option => option.setName('mode').setDescription('Select a game mode').addChoices(...arenas)).addStringOption(option => option.setName('status').setDescription('Select an arena status').addChoices(...statuses)),
    new SlashCommandBuilder().setName('blog').setDescription("Display recent blog entries"),
    new SlashCommandBuilder().setName('bots').setDescription("Display online bots"),
    new SlashCommandBuilder().setName('broadcast').setDescription("Find an upcoming or recent broadcast"),
    new SlashCommandBuilder().setName('coach').setDescription("Find a coach"),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your lishogi username from the bot's database"),
    new SlashCommandBuilder().setName('eval').setDescription("Get the cached evaluation of a position, if available").addStringOption(option => option.setName('sfen').setDescription('SFEN (Shogi Forsyth-Edwards Notation)')),
    new SlashCommandBuilder().setName('fesa').setDescription("Display FESA news"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Display top-rated players").addStringOption(option => option.setName('mode').setDescription('Select a game mode').addChoices(...modes)),
    new SlashCommandBuilder().setName('playing').setDescription("Share your (or a user's) current game").addStringOption(option => option.setName('username').setDescription('Enter lishogi player username')),
    new SlashCommandBuilder().setName('news').setDescription("Display recent news"),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter lishogi player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('reddit').setDescription("Fetch hot r/shogi posts"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your lishogi username").addStringOption(option => option.setName('username').setDescription('Enter your lishogi username').setRequired(true)),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition"),
    new SlashCommandBuilder().setName('streamers').setDescription("Display live streamers"),
    new SlashCommandBuilder().setName('team').setDescription("Search teams for a keyword").addStringOption(option => option.setName('text').setDescription('Search keywords').setRequired(true)),
    new SlashCommandBuilder().setName('timestamp').setDescription("Print discord magic timestamp").addIntegerOption(option => option.setName('year').setDescription('Year').setRequired(true)).addIntegerOption(option => option.setName('month').setDescription('Month (1-12)').setRequired(true)).addIntegerOption(option => option.setName('day').setDescription('Day').setRequired(true)).addIntegerOption(option => option.setName('hour').setDescription('Hour').addChoices(...hours)).addIntegerOption(option => option.setName('minute').setDescription('Minute').addChoices(...minutes)).addIntegerOption(option => option.setName('second').setDescription('Second')).addIntegerOption(option => option.setName('offset').setDescription('UTC offset')),
    new SlashCommandBuilder().setName('tv').setDescription("Share the featured game").addStringOption(option => option.setName('mode').setDescription('Select a game mode').addChoices(...channels)),
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

