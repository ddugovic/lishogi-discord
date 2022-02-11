const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = [
    new SlashCommandBuilder().setName('arena').setDescription("Find an upcoming or recent arena created by lishogi (or a user)"),
    new SlashCommandBuilder().setName('broadcast').setDescription("Find an upcoming or recent broadcast created by lishogi"),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Deletes your lishogi username from the bot's database"),
    new SlashCommandBuilder().setName('playing').setDescription("Shares your (or a user's) ongoing game"),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Displays your (or a user's) profile"),
    new SlashCommandBuilder().setName('puzzle').setDescription("Displays today's puzzle"),
    new SlashCommandBuilder().setName('recent').setDescription("Shares your most recent game"),
    new SlashCommandBuilder().setName('setgamemode').setDescription("Sets your favorite game (or puzzle) mode").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode')),
    new SlashCommandBuilder().setName('setuser').setDescription("Sets your lishogi username").addStringOption(option => option.setName('username').setDescription('Enter your lishogi username')),
    new SlashCommandBuilder().setName('tv').setDescription("Shares the featured game").addStringOption(option => option.setName('mode').setDescription('Enter your favorite game (or puzzle) mode')),
    new SlashCommandBuilder().setName('whoami').setDescription("Returns your lishogi username"),
    new SlashCommandBuilder().setName('help').setDescription("Sends a list of available commands")
]
    .map(command => command.toJSON());

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })
    .then(() => console.log('Successfully registered application slash commands.'))
    .catch(console.error);

