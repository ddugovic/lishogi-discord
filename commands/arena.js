const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const { formatTitledUserLink } = require('../lib/format-site-links');

function arena(author, mode, status, interaction) {
    const suffix = [status, mode].join(' ').trim();
    const header = { headers: { Accept: 'application/json' } };
    return axios.get('https://lichess.org/api/tournament', header)
        .then(response => setArenas(response.data, mode, status))
        .then(embeds => formatPages(embeds, interaction, suffix ? `No ${suffix} tournament found.` : 'No tournament found!'))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error} ${error.stack}`);
            console.log(`Error in arena(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function setArenas(data, mode, status) {
    var arenas = [];
    for (const [key, value] of Object.entries(data))
        if (!status || key == status)
            arenas.push(...value);
    if (mode)
        arenas = arenas.filter(arena => filterArena(arena, mode));
    return arenas.length == 1 ? [await setArena(arenas[0])] : arenas.map(formatArena);
}

function filterArena(arena, mode) {
    return mode == 'thematic' ? arena.position : arena.perf.key.toLowerCase() == mode;
}

function setArena(arena) {
    const url = `https://lichess.org/api/tournament/${arena.id}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatArena(response.data));
}

function formatArena(arena) {
    const red = Math.min(arena.nbPlayers, 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: arena.createdBy, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${arena.fullName}${formatSchedule(arena.schedule)}`)
        .setURL(`https://lichess.org/tournament/${arena.id}`)
        .setDescription(getDescription(arena));
    if (arena.featured)
	embed = embed.setImage(`https://lichess.org/export/gif/${formatGame(arena.featured)}?lastMove=${arena.featured.lastMove}`);
    if (arena.stats && (arena.stats.berserks + arena.stats.games + arena.stats.moves)) {
        embed = embed
            .addFields(
                { name: 'Berserks', value: `**${arena.stats.berserks}**`, inline: true },
                { name: 'Games', value: `**${arena.stats.games}** (+**${arena.stats.whiteWins}** -**${arena.stats.blackWins}** =**${arena.stats.draws}**)`, inline: true },
                { name: 'Moves', value: `**${arena.stats.moves}** (**${Math.round(arena.stats.moves / arena.minutes)}** per minute)`, inline: true }
            );
    }
    if (!arena.pairingsClosed) {
        const restrictions = formatRestrictions(arena);
        if (restrictions.length)
            embed = embed.addFields({ name: 'Restrictions', value: restrictions.join('\n') });
    }
    return embed;
}

function formatRestrictions(arena) {
    const restrictions = [];
    if (arena.onlyTitled)
        restrictions.push('National or FIDE title required');
    if (arena.hasMinRating)
        restrictions.push(`${title(arena.minRating.perf)} current rating must be at least **${arena.minRating.rating}**.`);
    if (arena.hasMaxRating)
        restrictions.push(`${title(arena.maxRating.perf)} weekly rating cannot exceed **${arena.maxRating.rating}**.`);
    if (arena.minRatedGames)
        restrictions.push(`**${arena.minRatedGames.nb}** rated ${arena.minRatedGames.perf} games are required.`);
    return restrictions;
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
    const clock = formatClock(arena.clock.limit, arena.clock.increment);
    const rated = arena.rated ? 'rated' : 'casual';
    const winner = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` :
        arena.isFinished ? `${formatPlayer(arena.podium[0])} takes the prize home!` :
        arena.secondsToStart ? `Starts <t:${Math.floor(Date.now()/1000) + arena.secondsToStart}:R>.` :
        arena.secondsToFinish ? `Finishes <t:${Math.floor(Date.now()/1000) + arena.secondsToFinish}:R>.` :
        arena.startsAt && arena.status < 20 ? `Starts <t:${Math.floor(arena.startsAt/1000)}:R>.` :
        arena.finishesAt ? `Finishes <t:${Math.floor(arena.finishesAt/1000)}:R>.` : '';
    return `${players} ${clock} ${rated} games are played during **${arena.minutes}** minutes. ${winner}`;
}

function formatPlayer(player) {
    return formatTitledUserLink(player.title, player.name);
}

function title(str) {
    if (str == 'kingOfTheHill')
        return 'King of the Hill';
    if (str == 'racingKings')
        return 'Racing Kings';
    str = str.replace(/([a-z])([A-Z])/g, '$1-$2');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function process(bot, msg, suffix) {
    arena(msg.author, ...suffix.split(/ /, 2)).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    arena(interaction.user, interaction.options.getString('mode'), interaction.options.getString('status'), interaction);
}

module.exports = {process, interact};
