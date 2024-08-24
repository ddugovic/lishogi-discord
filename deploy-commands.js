const { PermissionFlagsBits } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

const guildCommands = [
    new SlashCommandBuilder().setName('stop').setDescription("Stop Woogles Statbot (owner only)")
]
    .map(command => command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON());

const lexica = [
    { name: 'CSW 21 (World English)', value: 'CSW21' },
    { name: 'NWL 23 (North American English)', value: 'NWL23' },
    { name: 'CEL (Common English)', value: 'ECWL' },
    { name: 'Català (Catalan)', value: 'DISC2' },
    { name: 'Deutsch (German)', value: 'RD28' },
    { name: 'Français (French)', value: 'FRA24' },
    { name: 'Norsk (Norwegian)', value: 'NSF23' },
    { name: 'Polski (Polish)', value: 'OSPS49' },
    { name: 'CSW19X (School Expurgated)', value: 'CSW19X' },
    { name: 'NSWL 20 (NASPA School Word List)', value: 'NSWL20' }
];

const xtlexica = [
    { name: 'CSW', value: 'CSW' },
    { name: 'TWL', value: 'TWL' }
];

const commands = [
    new SlashCommandBuilder().setName('anagram').setDescription("Define anagrams of alphagrams from lexicon").addStringOption(option => option.setName('lexicon').setDescription('Select lexicon').setRequired(true).addChoices(...lexica)).addStringOption(option => option.setName('alphagrams').setDescription('Enter alphagrams to anagram and define').setRequired(true)),
    new SlashCommandBuilder().setName('blog').setDescription("Display recent blog entries"),
    new SlashCommandBuilder().setName('chat').setDescription("Display lobby chat"),
    new SlashCommandBuilder().setName('define').setDescription("Define words from lexicon").addStringOption(option => option.setName('lexicon').setDescription('Select lexicon').setRequired(true).addChoices(...lexica)).addStringOption(option => option.setName('words').setDescription('Enter words to define').setRequired(true)),
    new SlashCommandBuilder().setName('deleteuser').setDescription("Delete your woogles username from the bot's database"),
    //new SlashCommandBuilder().setName('equity').setDescription("Estimate rack equity").addStringOption(option => option.setName('lexicon').setDescription('Select lexicon').setRequired(true).addChoices(...xtlexica)).addStringOption(option => option.setName('rack').setDescription('Enter rack').setRequired(true)),
    new SlashCommandBuilder().setName('news').setDescription("Display the latest announcement"),
    new SlashCommandBuilder().setName('recent').setDescription("Share your (or a user's) recent games").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')).addBooleanOption(option => option.setName('fast').setDescription('Select replay speed (fast or normal)')),
    new SlashCommandBuilder().setName('privacy').setDescription("View privacy policy"),
    new SlashCommandBuilder().setName('profile').setDescription("Display your (or a user's) profile").addStringOption(option => option.setName('username').setDescription('Enter woogles player username')),
    new SlashCommandBuilder().setName('puzzle').setDescription("Display today's puzzle"),
    new SlashCommandBuilder().setName('setuser').setDescription("Set your woogles username").addStringOption(option => option.setName('username').setDescription('Enter your woogles username').setRequired(true)),
    new SlashCommandBuilder().setName('timestamp').setDescription("Print discord magic timestamp").addIntegerOption(option => option.setName('year').setDescription('Year (1970-)').setMinValue(1970).setRequired(true)).addIntegerOption(option => option.setName('month').setDescription('Month (1-12)').setMinValue(1).setMaxValue(12).setRequired(true)).addIntegerOption(option => option.setName('day').setDescription('Day (1-31)').setMinValue(1).setMaxValue(31).setRequired(true)).addIntegerOption(option => option.setName('hour').setDescription('Hour (0-23)').setMinValue(0).setMaxValue(23).setRequired(true)).addIntegerOption(option => option.setName('minute').setDescription('Minute (0-59)').setMinValue(0).setMaxValue(59).setRequired(true)).addIntegerOption(option => option.setName('offset').setDescription('UTC offset between -12 and +14').setMinValue(-12).setMaxValue(14)),
    new SlashCommandBuilder().setName('help').setDescription("List available commands")
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

