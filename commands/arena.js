const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { formatTitledUserLink } = require('../lib/format-site-links');
const User = require('../models/User');

async function arena(author, mode, interaction) {
    if (!mode)
        mode = await getMode(author);
    const url = 'https://lishogi.org/api/tournament';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setArenas(mergeArenas(response.data), mode))
        .then(embeds => formatPages(embeds, interaction, 'No tournament found!'))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.favoriteMode;
}

function mergeArenas(data) {
    const arenas = [];
    for (const status in data)
        arenas.push(...data[status]);
    return arenas;
}

function setArenas(areans, mode) {
    if (mode) {
        const matches = arenas.filter(arena => filterArena(arena, mode));
        if (matches.length)
            return matches.sort(compareArenas).map(formatArena);
    }
    return arenas.sort(compareArenas).map(formatArena);
}

function filterArena(arena, mode) {
    return mode == 'thematic' ? arena.position : arena.perf.key.toLowerCase() == mode;
}

function compareArenas(a, b) {
    return b.nbPlayers / (b.status || 10) - (a.nbPlayers / (a.status || 10));
}

function formatArena(arena) {
    const speed = Math.floor(Math.min(Math.max(arena.clock.limit + arena.clock.increment * 40, 0), 255) / 2);
    var embed = new MessageEmbed()
        .setColor(formatColor(255-speed, 0, speed))
        .setAuthor({name: arena.createdBy, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png'})
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(`${arena.fullName}${formatSchedule(arena.schedule)}`)
        .setURL(`https://lishogi.org/tournament/${arena.id}`)
        .setDescription(getDescription(arena));
    if (arena.featured)
	embed = embed.setImage(`https://lishogi.org/export/gif/${formatGame(arena.featured)}?lastMove=${arena.featured.lastMove}`);
    if (arena.stats) {
        embed = embed
            .addField('Berserks', `**${arena.stats.berserks}**`, true)
            .addField('Games', `**${arena.stats.games}** (+**${arena.stats.senteWins}** -**${arena.stats.goteWins}** =**${arena.stats.draws}**)`, true)
            .addField('Moves', `**${arena.stats.moves}** (**${Math.round(arena.stats.moves / arena.minutes)}** per minute)`, true);
    }
    if (arena.minRatedGames) {
        embed = embed
            .addField('Restrictions', `**${arena.minRatedGames.nb}** rated ${arena.minRatedGames.perf} games are required.`);
    }
    return embed;
}

function formatGame(game) {
    return game.fen.replace(/ /g,'_');
}

function formatSchedule(schedule) {
    return schedule.freq == 'shield' ? ' :shield:' :
        schedule.freq == 'daily' ? ' :calendar:' :
        schedule.freq == 'weekly' ? ' :calendar:' :
        schedule.freq == 'monthly' ? ' :calendar:' :
        schedule.freq == 'yearly' ? ' :calendar:' : '';
}

function getDescription(arena) {
    const players = arena.nbPlayers == 1 ? '**1** player' : `**${arena.nbPlayers}** players`;
    const play = arena.status == 30 ? 'competed in' : arena.status == 20 ? `${(arena.nbPlayers == 1 ? 'competes' : 'compete')} in` : 'await';
    const clock = `${arena.clock.limit / 60}+${arena.clock.increment}`;
    const rated = arena.rated ? 'rated' : 'casual';
    const winner = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` :
        arena.status < 20 ? `Starts <t:${arena.startsAt}:R>` : '';
        arena.status < 30 ? `Finishes <t:${arena.finishesAt}:R>` : '';
    return `${players} ${play} in the ${arena.fullName}. ${clock} ${rated} games are played during **${arena.minutes}** minutes. ${winner}`;
}

function formatPlayer(player) {
    return formatTitledUserLink(player.title, player.name);
}

function process(bot, msg, favoriteMode) {
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    return arena(interaction.user, interaction.options.getString('mode'), interact);
}

module.exports = {process, interact};
