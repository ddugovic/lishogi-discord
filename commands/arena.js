const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { formatTitledUserLink } = require('../lib/format-site-links');
const User = require('../models/User');

async function arena(author, mode) {
    if (!mode) {
        const user = await User.findById(author.id).exec();
        if (user)
	    mode = user.favoriteMode;
    }
    const url = 'https://lidraughts.org/api/tournament';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setArena(response.data, mode))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function setArena(data, mode) {
    if (mode) {
        for (var status in data) {
            const arenas = data[status].filter(arena => arena.perf.key.toLowerCase() == mode);
            if (arenas.length)
                return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
        }
    }
    for (var status in data) {
        const arenas = data[status];
        if (arenas.length)
            return formatArena(arenas.sort((a,b) => b.nbPlayers - a.nbPlayers)[0]);
    }
    return 'No tournament found!';
}

function formatArena(arena) {
    const speed = Math.floor(Math.min(Math.max(arena.clock.limit + arena.clock.increment * 40, 0), 255) / 2);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-speed, 0, speed))
        .setAuthor({name: arena.createdBy, iconURL: 'https://lidraughts.org/assets/images/lidraughts-32-white.png'})
        .setThumbnail('https://lidraughts.org/assets/favicon.64.png')
        .setTitle(`${arena.fullName}${formatSchedule(arena.schedule)}`)
        .setURL(`https://lidraughts.org/tournament/${arena.id}`)
        .setDescription(getDescription(arena));
    if (arena.featured)
	embed = embed.setImage(`https://lidraughts.org/export/gif/${formatGame(arena.featured)}?lastMove=${arena.featured.lastMove}`);
    if (arena.stats && (arena.stats.berserks + arena.stats.games + arena.stats.moves)) {
        embed = embed
            .addField('Berserks', `**${arena.stats.berserks}**`, true)
            .addField('Games', `**${arena.stats.games}** (+**${arena.stats.senteWins}** -**${arena.stats.goteWins}** =**${arena.stats.draws}**)`, true)
            .addField('Moves', `**${arena.stats.moves}** (**${Math.round(arena.stats.moves / arena.minutes)}** per minute)`, true);
    }
    if (arena.minRatedGames && !arena.pairingsClosed)
        embed = embed
            .addField('Restrictions', `**${arena.minRatedGames.nb}** rated ${arena.minRatedGames.perf} games are required.`);
    return embed;
}


function process(bot, msg, favoriteMode) {
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return arena(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
