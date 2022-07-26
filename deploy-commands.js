const { PermissionFlagsBits } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

const guildCommands = [
    new SlashCommandBuilder().setName('stop').setDescription("Stop the bot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const lexica = [
    { name: 'CSW 21 (World English)', value: 'CSW21' },
    { name: 'NWL 20 (North American English)', value: 'NWL20' },
    { name: 'CEL (Common English)', value: 'ECWL' },
    { name: 'Deutsch (German)', value: 'RD28' },
    { name: 'Français (French)', value: 'FRA20' },
    { name: 'Norsk (Norwegian)', value: 'NSF21' },
    { name: 'NSWL 20 (NASPA School Word List)', value: 'NSWL' },
];

const commands = [
    new SlashCommandBuilder().setName('anagram').setDescription("Define anagrams of alphagrams from lexicon").addStringOption(option => option.setName('lexicon').setDescription('Select lexicon').setRequired(true).addChoices(...lexica)).addStringOption(option => option.setName('alphagrams').setDescription('Enter alphagrams to anagram and define').setRequired(true)),
    new SlashCommandBuilder().setName('define').setDescription("Define words from lexicon").addStringOption(option => option.setName('lexicon').setDescription('Select lexicon').setRequired(true).addChoices(...lexica)).addStringOption(option => option.setName('words').setDescription('Enter words to define').setRequired(true)),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your woogles username from the bot's database"),
    new SlashCommandBuilder().setName('news').setDescription("Display the latest announcement"),
    new SlashCommandBuilder().setName('recent').setDescription("Share your (or a user's) recent games").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your woogles username").addStringOption(option => option.setName('username').setDescription('Enter your woogles username').setRequired(true)),
    new SlashCommandBuilder().setName('help').setDescription("Send a list of available commands")
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

