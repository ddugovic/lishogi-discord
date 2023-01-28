const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const { formatError, formatPages } = require('../lib/format-pages');
const { formatTitledUserLink } = require('../lib/format-site-links');
const plural = require('plural');

function arena(author, mode, progress, interaction) {
    const suffix = [status, mode].join(' ').trim();
    let status, statusText;
    const url = 'https://lishogi.org/api/tournament';
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setArenas(json, mode, progress))
        .then(embeds => formatPages('Tournament', embeds, interaction, suffix ? `No ${suffix} tournament found.` : 'No tournament found!'))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}, ${progress}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
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
    return mode == 'thematic' ? arena.position : arena.perf.key == mode;
}

function setArena(arena) {
    const url = `https://lishogi.org/api/tournament/${arena.id}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(response => formatArena(json));
}

function formatArena(arena) {
    const speed = Math.floor(Math.min(Math.max(arena.clock.limit + arena.clock.increment * 40, 0), 255) / 2);
    var embed = new EmbedBuilder()
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
            .addFields(
                { name: 'Berserks', value: `**${arena.stats.berserks}**`, inline: true },
                { name: 'Games', value: `**${arena.stats.games}** (+**${arena.stats.senteWins}** -**${arena.stats.goteWins}** =**${arena.stats.draws}**)`, inline: true },
                { name: 'Moves', value: `**${arena.stats.moves}** (**${Math.round(arena.stats.moves / arena.minutes)}** per minute)`, inline: true }
            )
    }
    if (!arena.pairingsClosed) {
        const restrictions = formatRestrictions(arena);
        if (restrictions.length)
            embed = embed.addFields({ name: plural('Restriction', restrictions.length), value: restrictions.join('\n') });
    }
    return embed;
}

function formatRestrictions(arena) {
    const restrictions = [];
    if (arena.onlyTitled)
        restrictions.push('National or FESA title required');
    if (arena.hasMinRating)
        restrictions.push(`${title(arena.minRating.perf)} current rating must be at least **${arena.minRating.rating}**.`);
    if (arena.hasMaxRating)
        restrictions.push(`${title(arena.maxRating.perf)} weekly rating cannot exceed **${arena.maxRating.rating}**.`);
    if (arena.minRatedGames)
        restrictions.push(`**${arena.minRatedGames.nb}** rated ${title(arena.minRatedGames.perf).toLowerCase()} games are required.`);
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
    const clock = formatClock(arena.clock);
    const rated = arena.rated ? 'rated' : 'casual';
    const status = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` :
        arena.isFinished ? `${formatPlayer(arena.podium[0])} takes the prize home!` :
        arena.secondsToStart ? `Starts <t:${Math.floor(Date.now()/1000) + arena.secondsToStart}:R>.` :
        arena.secondsToFinish ? `Finishes <t:${Math.floor(Date.now()/1000) + arena.secondsToFinish}:R>.` :
        arena.startsAt && arena.status < 20 ? `Starts <t:${Math.floor(arena.startsAt/1000)}:R>.` :
        arena.finishesAt ? `Finishes <t:${Math.floor(arena.finishesAt/1000)}:R>.` : '';
    return `${players}\n${clock} ${rated} games are played during **${arena.minutes}** minutes.\n${status}`;
}

function formatPlayer(player) {
    return formatTitledUserLink(player.title, player.name);
}

function title(str) {
    str = str.replace(/([a-z])([A-Z])/g, '$1-$2');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function process(bot, msg, suffix) {
    arena(msg.author, ...suffix.split(/ /, 2)).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    arena(interaction.user, interaction.options.getString('mode'), interaction.options.getString('status'), interaction);
}

module.exports = {process, interact};
