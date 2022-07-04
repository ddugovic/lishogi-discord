const config = require('./config.json');
const Discord = require('discord.js');
const publisher = require('discord-lister');

// Set up the database
const mongoose = require('mongoose');
mongoose.connect(config.mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Initialize client
const client = new Discord.Client({
    allowedMentions: { parse: [] },
    disabledEvents: ['TYPING_START'],
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
    presence: { activities: [{ name: 'woogles.io' , type: 'WATCHING' }], status: 'online' }
});

// Set up commands
const commands = require('./commands');
const help = require('./commands/help');
const stop = require('./commands/stop');

client.on('ready', () => {
    console.log(`Bot is online!\n${client.users.cache.size} users, in ${client.guilds.cache.size} servers connected.`);
});

client.on('guildCreate', (guild) => {
    console.log(`Joining guild ${guild.id} [${guild.name}], owned by @${guild.ownerId}.`);
});

client.on('messageCreate', (msg) => {
    //drop bot messages (including our own) to prevent feedback loops
    if (msg.author.bot) {
        return;
    }
    let cmdTxt = '';
    let suffix = '';
    if (msg.content[0] === config.prefix) {
        const text = msg.content.substring(1);
        if (text.includes(' '))
            [cmdTxt, suffix] = text.split(/ +/, 2);
        else
            [cmdTxt, suffix] = [text, ''];
    } else {
        return;
    }
    let command = commands[cmdTxt];
    if (command && suffix.indexOf('@') == -1) {
        console.log(`Evaluating command ${msg.content} from ${msg.author} (${msg.author.username})`);
        try {
            command.process(client, msg, suffix);
        } catch (e) {
            console.log(`Command failed:\n ${e.stack}`);
            msg.channel.send(`Command ${cmdTxt} failed :(\n ${e.stack}`);
        }
    } else if (cmdTxt == 'help') {
        console.log(`Evaluating command ${msg.content} from ${msg.author} (${msg.author.username})`);
        help.process(commands, msg, suffix);
    } else if (cmdTxt == 'stop') {
        console.log(`Evaluating command ${msg.content} from ${msg.author} (${msg.author.username})`);
        stop.process(client, msg, suffix);
    } else if (config.respondToInvalid) {
        msg.channel.send(`Invalid command!`);
    }
});

// Catch Errors before they crash the app.
process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    process.exit(1); //Gracefully exit so systemd service may restart
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    process.exit(1); //Gracefully exit so systemd service may restart
});

client.login(config.token);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    console.log(interaction.user.id, interaction.commandName);
    const cmdTxt = interaction.commandName;
    let command = commands[cmdTxt];
    if (command) {
        await interaction.deferReply();
        try {
            if (command.interact)
                command.interact(interaction);
            else
                await interaction.editReply(await command.reply(interaction));
        } catch (e) {
            console.log(`Command failed:\n ${e.stack}`);
        }
    } else if (cmdTxt == 'help') {
        await interaction.reply({ content: help.reply(commands, interaction), ephemeral: true });
    } else if (config.respondToInvalid) {
        await interaction.reply({ content: 'Invalid command!', ephemeral: true });
    }
});

// Catch Errors before they crash the app.
process.on('uncaughtException', (err) => {
});

function publish(config, client) {
    console.log(`${client.users.cache.size} users, in ${client.guilds.cache.size} servers connected.`);
    let settings = {
	listings: {
		// tokens for sites here
		// leave blank or remove site if not posting to that site
		topgg: config.topggtoken,
		discordbotsgg: config.discordbotsggtoken,
		discordboats: config.discordboatstoken,
		botsondiscord: config.botsondiscordtoken,
		botsfordiscord: config.botsfordiscordtoken,
		botlistspace: config.botlistspacetoken,
		topcord: config.topcordtoken,
		discordextremelist: config.discordextremelisttoken,
		discordbotlist: config.discordbotlisttoken,
		sentcord: config.sentcordtoken,
		dbotsco: config.dbotscotoken,
		discordlabs: config.discordlabstoken,
		blist: config.blisttoken
	},
	// the following is required
	clientid: client.user.id,
	servercount: client.guilds.cache.size,
	shardscount: 1,
	shardsid: 0,
	usercount: client.users.cache.size,
	output: config.debug
    }
    publisher.post(settings)
}

setInterval(publish, 1800000, config, client);

