const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
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
    const arenas = [];
    for (const status in data)
        arenas.push(...data[status]);

    if (mode) {
        const matches = arenas.filter(arena => filterArena(arena, mode));
        if (matches.length)
            return formatArena(matches.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
    }
    if (arenas.length)
        return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
    return 'No tournament found!';
}

function filterArena(arena, mode) {
    return mode == 'thematic' ? arena.position : arena.perf.key.toLowerCase() == mode;
}

function formatArena(arena) {
    const speed = Math.floor(Math.min(Math.max(arena.clock.limit + arena.clock.increment * 40, 0), 255) / 2);
    const start = Math.floor(arena.startsAt / 1000);
    const clock = `${arena.clock.limit / 60}+${arena.clock.increment}`;
    const rated = arena.rated ? 'rated' : 'casual';
    const players = arena.nbPlayers == 1 ? '1 player competes' : `${arena.nbPlayers} players compete`;
    const winner = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` : 'Winner is not yet decided.';
    var embed = new Discord.MessageEmbed()
        .setColor(formatColor(255-speed, 0, speed))
        .setAuthor({name: arena.createdBy, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${arena.fullName}${formatSchedule(arena.schedule)}`)
        .setURL(`https://lichess.org/tournament/${arena.id}`)
        .setDescription(`${players} in the <t:${start}:t> ${arena.fullName}. ${clock} ${rated} games are played during ${arena.minutes} minutes. ${winner}`);
    if (arena.position)
	embed = embed.setImage(`https://lichess.org/export/gif/${formatPosition(arena.position)}`);
    return { embeds: [ embed ] };
}

function formatPosition(position) {
    return position.fen.replace(/ /g,'_');
}

function formatSchedule(schedule) {
    return schedule.freq == 'shield' ? ' :shield:' :
        schedule.freq == 'daily' ? ' :calendar:' :
        schedule.freq == 'weekly' ? ' :calendar:' :
        schedule.freq == 'monthly' ? ' :calendar:' :
        schedule.freq == 'yearly' ? ' :calendar:' : '';
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
