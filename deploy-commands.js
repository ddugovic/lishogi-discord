const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = [
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your woogles username from the bot's database"),
    new SlashCommandBuilder().setName('news').setDescription("Display the latest announcement"),
    new SlashCommandBuilder().setName('recent').setDescription("Share your (or a user's) recent game").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('gif').setDescription("Share your (or a user's) recent game as a GIF").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your woogles username").addStringOption(option => option.setName('username').setDescription('Enter your woogles username').setRequired(true)),
    new SlashCommandBuilder().setName('help').setDescription("Send a list of available commands")
]
    .map(command => command.toJSON());

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const rest = new REST({ version: '10' }).setToken(config.token);
rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} application slash commands for client ${config.clientId}.`))
    .catch(console.error);

