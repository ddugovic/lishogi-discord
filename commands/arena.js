const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { formatTitledUserLink } = require('../lib/format-site-links');

function arena(user, mode, interaction) {
    const header = { headers: { Accept: 'application/json' } };
    let status, statusText;
    return fetch('https://playstrategy.org/api/tournament', header)
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setArenas(mergeArenas(json), mode))
        .then(embeds => formatPages(embeds, interaction, 'No tournament found!'))
        .catch(error => {
            console.log(`Error in arena(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function mergeArenas(data) {
    const arenas = [];
    for (const status in data)
        arenas.push(...data[status]);
    return arenas.sort((a,b) => a.startsAt - b.startsAt);
}

async function setArenas(arenas, mode) {
    if (mode)
        arenas = arenas.filter(arena => filterArena(arena, mode));
    arenas = arenas.sort(compareArenas);
    return arenas.length == 1 ? [await setArena(arenas[0])] : arenas.map(formatArena);
}

function filterArena(arena, mode) {
    return mode == 'thematic' ? arena.position : arena.perf.key.toLowerCase() == mode;
}

function setArena(arena) {
    const url = `https://playstrategy.org/api/tournament/${arena.id}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => formatArena(json));
}

function compareArenas(a, b) {
    return b.nbPlayers / (b.status || 10) - (a.nbPlayers / (a.status || 10));
}

function formatArena(arena) {
    const speed = Math.floor(Math.min(Math.max(arena.clock.limit + (arena.clock.byoyomi ?? arena.clock.delay ?? arena.clock.increment) * 40, 0), 255) / 2);
    var embed = new EmbedBuilder()
        .setColor(formatColor(255-speed, 0, speed))
        .setAuthor({name: arena.createdBy, iconURL: 'https://playstrategy.org/assets/images/playstrategy-32-white.png'})
        .setThumbnail('https://assets.playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setTitle(arena.fullName)
        .setURL(`https://playstrategy.org/tournament/${arena.id}`)
        .setDescription(getDescription(arena));
    if (arena.featured)
	embed = embed.setImage(`https://playstrategy.org/export/gif/${formatGame(arena.featured)}?lastMove=${arena.featured.lastMove}`);
    if (arena.stats && (arena.stats.berserks + arena.stats.games + arena.stats.moves)) {
        embed = embed
            .addFields(
                { name: 'Berserks', value: `**${arena.stats.berserks}**`, inline: true },
                { name: 'Games', value: `**${arena.stats.games}** (+**${arena.stats.whiteWins}** -**${arena.stats.blackWins}** =**${arena.stats.draws}**)`, inline: true },
                { name: 'Moves', value: `**${arena.stats.moves}** (**${Math.round(arena.stats.moves / arena.minutes)}** per minute)`, inline: true }
            )
    }
    if (arena.minRatedGames && !arena.pairingsClosed)
        embed = embed
            .addFields({ name: 'Restrictions', value: `**${arena.minRatedGames.nb}** rated ${arena.minRatedGames.perf} games are required.` });
    return embed;
}

function formatGame(game) {
    return game.fen.replace(/ /g,'_');
}

function getDescription(arena) {
    const players = arena.nbPlayers ? arena.nbPlayers == 1 ? `**1** player competes in the ${arena.fullName}.` : `**${arena.nbPlayers}** players compete in the ${arena.fullName}.` : '';
    const clock = formatClock(arena.clock);
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
    return arena(interaction.user, interaction.options.getString('mode'), interaction);
}

module.exports = {process, interact};
