const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find an upcoming or recent arena created by lichess (or a user)").addStringOption(option => option.setName('mode').setDescription('Enter a game mode')),
    new SlashCommandBuilder().setName('broadcast').setDescription("Find an upcoming or recent broadcast created by lichess"),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Deletes your lichess username from the bot's database"),
    new SlashCommandBuilder().setName('leaderboard').setDescription("Displays the leaderboard top player").addStringOption(option => option.setName('mode').setDescription('Enter a game mode')),
    new SlashCommandBuilder().setName('playing').setDescription("Shares your (or a user's) ongoing game").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Displays your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter lichess player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Displays today's puzzle"),
    new SlashCommandBuilder().setName('recent').setDescription("Shares your most recent game").addStringOption(option => option.setName('rated').setDescription('Enter rated or casual')),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Sets your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode')),
    new SlashCommandBuilder().setName('setuser').setDescription("Sets your lichess username").addStringOption(option => option.setName('username').setDescription('Enter your lichess username')),
    new SlashCommandBuilder().setName('tv').setDescription("Shares the featured game").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode')),
    new SlashCommandBuilder().setName('whoami').setDescription("Returns your lichess username"),
    new SlashCommandBuilder().setName('help').setDescription("Sends a list of available commands")
]
    .map(command => command.toJSON());

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })
    .then(() => console.log('Successfully registered application guild slash commands.'))
    .catch(console.error);

rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log('Successfully registered application slash commands.'))
    .catch(console.error);

