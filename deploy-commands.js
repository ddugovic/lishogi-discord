const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = [
    new SlashCommandBuilder().setName('deleteuser').setDescription("Deletes your woogles username from the bot's database"),
    new SlashCommandBuilder().setName('news').setDescription("Displays the latest announcement"),
    new SlashCommandBuilder().setName('recent').setDescription("Shares your (or a user's) recent game URL").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('gif').setDescription("Shares your (or a user's) recent game").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Displays your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Displays today's puzzle"),
    new SlashCommandBuilder().setName('setuser').setDescription("Sets your woogles username").addStringOption(option => option.setName('username').setDescription('Enter your woogles username')),
    new SlashCommandBuilder().setName('help').setDescription("Sends a list of available commands")
];

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands.map(command => command.toJSON()) })
    .then(() => console.log(`Successfully registered ${commands.length} application guild slash commands for client ${config.clientId} in guild ${config.guildId}.`))
    .catch(console.error);

rest.put(Routes.applicationCommands(config.clientId), { body: commands.map(command => command.setDefaultMemberPermissions('0').toJSON()) })
    .then(() => console.log(`Successfully registered ${commands.length} application slash commands for client ${config.clientId}.`))
    .catch(console.error);

