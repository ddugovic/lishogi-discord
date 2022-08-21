const { PermissionFlagsBits } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

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
const modes = [
    { name: 'Blitz', value: 'blitz' },
    { name: 'Bullet', value: 'bullet' },
    { name: 'Classical', value: 'classical' },
    { name: 'Minishogi', value: 'minishogi' },
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
    new SlashCommandBuilder().setName('stop').setDescription("Stop the bot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find a created, started, or finished arena").addStringOption(option => option.setName('mode').setDescription('Select a game mode').addChoices(...modes)).addStringOption(option => option.setName('status').setDescription('Select an arena status').addChoices(...statuses)),
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
    new SlashCommandBuilder().setName('reddit').setDescription("Fetch r/shogi image"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Set your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode').addChoices(...ratings)),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your lishogi username").addStringOption(option => option.setName('username').setDescription('Enter your lishogi username').setRequired(true)),
    new SlashCommandBuilder().setName('simul').setDescription("Display a recently finished, ongoing, or upcoming simultanous exhibition"),
    new SlashCommandBuilder().setName('streamers').setDescription("Display live streamers"),
    new SlashCommandBuilder().setName('team').setDescription("Search teams for a keyword").addStringOption(option => option.setName('text').setDescription('Search keywords').setRequired(true)),
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

