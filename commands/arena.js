const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const formatPages = require('../lib/format-pages');
const { formatPositionURL, formatTitledUserLink } = require('../lib/format-site-links');
const formatVariant = require('../lib/format-variant');
const plural = require('plural');

function arena(author, mode, progress, theme, piece, interaction) {
    const url = 'https://lichess.org/api/tournament';
    const suffix = [progress, mode].join(' ').trim();
    const header = { headers: { Accept: 'application/json' } };
    let status, statusText;
    return fetch(url, header)
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => setArenas(json, mode, progress, theme ?? 'brown', piece ?? 'cburnett'))
        .then(embeds => formatPages(embeds, interaction, suffix ? `No ${suffix} tournament found.` : 'No tournament found!'))
        .catch(error => {
            console.log(`Error in arena(${author.username}, ${mode}, ${progress}, ${theme}, ${piece}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

async function setArenas(data, mode, progress, theme, piece) {
    var arenas = [];
    for (const [key, value] of Object.entries(data))
        if (!progress || key == progress)
            arenas.push(...value);
    if (mode)
        arenas = arenas.filter(arena => filterArena(arena, mode));
    return arenas.length == 1 ? [await setArena(arenas[0], theme, piece)] : arenas.map(arena => formatArena(arena, theme, piece));
}

function filterArena(arena, mode) {
    return mode == 'thematic' ? arena.position : arena.perf.key == mode;
}

function setArena(arena, theme, piece) {
    const url = `https://lichess.org/api/tournament/${arena.id}`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => formatArena(json, theme, piece));
}

function formatArena(arena, theme, piece) {
    const red = Math.min(arena.nbPlayers, 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: arena.createdBy, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${arena.fullName}${formatSchedule(arena.schedule)}`)
        .setURL(`https://lichess.org/tournament/${arena.id}`)
        .setDescription(getDescription(arena));
    const position = arena.featured ?? arena.position
    if (position)
	embed = embed.setImage(formatPositionURL(position.fen, position.lastMove, theme, piece));
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
            embed = embed.addFields({ name: plural('Restriction', restrictions.length), value: restrictions.join('\n') });
    }
    return embed;
}

function formatRestrictions(arena) {
    const restrictions = [];
    if (arena.onlyTitled)
        restrictions.push('* National or FIDE title required');
    if (arena.hasMinRating) {
        if (arena.minRating.perf) {
            restrictions.push(`* ${formatVariant(arena.minRating.perf)} current rating must be at least **${arena.minRating.rating}**.`);
        } else {
            restrictions.push(`* Current rating must be at least **${arena.minRating.rating}**.`);
        }
    }
    if (arena.hasMaxRating) {
        if (arena.maxRating.perf) {
            restrictions.push(`* ${formatVariant(arena.maxRating.perf)} weekly rating cannot exceed **${arena.maxRating.rating}**.`);
	} else {
            restrictions.push(`* Weekly rating cannot exceed **${arena.maxRating.rating}**.`);
	}
    }
    if (arena.minRatedGames) {
        if (arena.minRatedGames.perf) {
            restrictions.push(`* **${arena.minRatedGames.nb}** rated ${formatVariant(arena.minRatedGames.perf).toLowerCase()} games are required.`);
        } else {
            restrictions.push(`* **${arena.minRatedGames.nb}** rated games are required.`);
        }
    }
    return restrictions;
}

function formatSchedule(schedule) {
    return schedule.freq == 'shield' ? ' :shield:' :
        schedule.freq == 'hourly' ? ' :clock:' :
        schedule.freq == 'daily' ? ' :calendar:' :
        schedule.freq == 'weekly' ? ' :calendar:' :
        schedule.freq == 'monthly' ? ' :calendar:' :
        schedule.freq == 'yearly' ? ' :calendar:' : '';
}

function getDescription(arena) {
    const players = arena.nbPlayers ? arena.nbPlayers == 1 ? `**1** player competes in the ${arena.fullName}.` : `**${arena.nbPlayers}** players compete in the ${arena.fullName}.` : '';
    const clock = formatClock(arena.clock);
    const rated = arena.rated ? 'rated' : 'casual';
    const progress = arena.winner ? `${formatPlayer(arena.winner)} takes the prize home!` :
        arena.isFinished ? `${formatPlayer(arena.podium[0])} takes the prize home!` :
        arena.secondsToStart ? `Starts <t:${Math.floor(Date.now()/1000) + arena.secondsToStart}:R>.` :
        arena.secondsToFinish ? `Finishes <t:${Math.floor(Date.now()/1000) + arena.secondsToFinish}:R>.` :
        arena.startsAt && arena.progress < 20 ? `Starts <t:${Math.floor(arena.startsAt/1000)}:R>.` :
        arena.finishesAt ? `Finishes <t:${Math.floor(arena.finishesAt/1000)}:R>.` : '';
    return `${players}\n${clock} ${rated} games are played during **${arena.minutes}** minutes.\n${progress}`;
}

function formatPlayer(player) {
    return formatTitledUserLink(player.title, player.name);
}

function process(bot, msg, suffix) {
    arena(msg.author, ...suffix.split(/ /, 4)).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    arena(interaction.user, interaction.options.getString('mode'), interaction.options.getString('status'), interaction.options.getString('theme'), interaction.options.getString('piece'), interaction);
}

module.exports = {process, interact};
