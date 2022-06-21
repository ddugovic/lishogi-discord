const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');

async function arena(author, mode) {
    if (!mode) {
        const user = await User.findById(author.id).exec();
        if (user)
	    mode = user.favoriteMode;
    }
    const url = 'https://lichess.org/api/tournament';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setArena(response.data, mode))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setArena(data, mode) {
    if (mode) {
        for (const status in data) {
            const arenas = data[status].filter(arena => arena.perf.key.toLowerCase() == mode);
            if (arenas.length)
                return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
        }
    }
    for (const status in data) {
        const arenas = data[status];
        if (arenas.length)
            return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
    }
    return 'No tournament found!';
}

function formatArena(arena) {
    const start = Math.floor(arena.startsAt / 1000);
    const clock = `${arena.clock.limit / 60}+${arena.clock.increment}`;
    const rated = arena.rated ? 'rated' : 'casual';
    const winner = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` : 'Winner is not yet decided.';
    const embed = new Discord.MessageEmbed()
        .setAuthor({name: arena.createdBy, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(arena.fullName)
        .setURL(`https://lichess.org/tournament/${arena.id}`)
        .setDescription(`${arena.nbPlayers} players compete in the <t:${start}:t> ${arena.fullName}. ${clock} ${rated} games are played during ${arena.minutes} minutes. ${winner}`);
    return { embeds: [ embed ] };
}

function formatPlayer(player) {
    const name = player.title ? `${player.title} ${player.name}` : player.name;
    return `[${name}](https://lichess.org/@/${player.name})`;
}

function process(bot, msg, favoriteMode) {
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return arena(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
