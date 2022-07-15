const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { formatTitledUserLink } = require('../lib/format-site-links');

function arena(author, mode, interaction) {
    const header = { headers: { Accept: 'application/json' } };
    return axios.get('https://lishogi.org/api/tournament', header)
        .then(response => setArenas(mergeArenas(response.data), mode))
        .then(embeds => formatPages(embeds, interaction, 'No tournament found!'))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function mergeArenas(data) {
    const arenas = [];
    for (const status in data)
        arenas.push(...data[status]);
    return arenas;
}

async function setArenas(arenas, mode) {
    if (mode)
        arenas = arenas.filter(arena => filterArena(arena, mode));
    return arenas.length == 1 ? [await setArena(arenas.sort(compareArenas)[0])] : arenas.map(formatArena);
}

function filterArena(arena, mode) {
    return mode == 'thematic' ? arena.position : arena.perf.key.toLowerCase() == mode;
}

function setArena(arena) {
    const url = `https://lishogi.org/api/tournament/${arena.id}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatArena(response.data));
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
    const players = arena.nbPlayers ? arena.nbPlayers == 1 ? `**1** player competes in the ${arena.fullName}.` : `**${arena.nbPlayers}** players compete in the ${arena.fullName}.` : '';
    const clock = formatClock(arena.clock.limit, arena.clock.increment, arena.clock.byoyomi);
    const rated = arena.rated ? 'rated' : 'casual';
    const winner = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` :
        arena.isFinished ? `${formatPlayer(arena.podium[0])} takes the prize home!` :
        arena.secondsToStart ? `Starts <t:${Math.floor(Date.now()/1000) + arena.secondsToStart}:R>` :
        arena.secondsToFinish ? `Finishes <t:${Math.floor(Date.now()/1000) + arena.secondsToFinish}:R>` :
        arena.startsAt && arena.status < 20 ? `Starts <t:${Math.floor(arena.startsAt/1000)}:R>` :
        arena.finishesAt ? `Finishes <t:${Math.floor(arena.finishesAt/1000)}:R>` : '';
    return `${players} ${clock} ${rated} games are played during **${arena.minutes}** minutes. ${winner}`;
}

function formatPlayer(player) {
    return formatTitledUserLink(player.title, player.name);
}

function process(bot, msg, favoriteMode) {
    arena(msg.author, favoriteMode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    arena(interaction.user, interaction.options.getString('mode'), interaction);
}

module.exports = {process, interact};
