const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatVariant = require('../lib/format-variant');
const { formatSanVariation, numberVariation } = require('../lib/format-variation');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = `https://lichess.org/api/tv/${mode ?? 'best'}?nb=3&opening=true`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' }, params: { nb: 3, opening: true } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
	.then(text => parseDocument(text))
        .then(games => {
            const embed = formatChannel(mode ?? 'best', formatVariant(mode ?? 'Top Rated'), games[0]);
            return embed.addFields({ name: 'Live Games', value: games.map(formatGame).join('\n\n') });
        })
        .then(embed => { return embed ? { embeds: [ embed ] } : 'Channel not found!' })
        .catch(error => {
            console.log(`Error in tv(${author.username}, ${mode}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user && user.favoriteMode != 'puzzle')
        return user.favoriteMode;
}

function formatChannel(channel, name, game) {
    const players = [game.players.white, game.players.black];
    return new EmbedBuilder()
        .setColor(getColor(game.players))
        .setThumbnail(`https://lichess1.org/game/export/gif/thumbnail/${game.id}.gif`)
        .setTitle(`${name} :tv: ${players.map(formatPlayer).join(' - ')}`)
        .setURL(`https://lichess.org/tv/${channel}`)
        .setDescription(`Sit back, relax, and watch the best ${name} games on Lichess!`);
}

function formatGame(game) {
    const url = `https://lichess.org/${game.id}`;
    const players = [game.players.white, game.players.black].map(formatPlayer).join(' - ');
    const opening = game.moves ? `\n${formatOpening(game.opening, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} [${players}](${url})${opening}`;
}

function formatOpening(opening, moves) {
    const ply = opening ? opening.ply : 10;
    const variation = moves.split(/ /).slice(0, ply);
    return opening ? `${opening.name} *${formatSanVariation(null, variation)}*` : `*${numberVariation(variation)}*`;
}

function getColor(players) {
    const rating = ((players.white.rating ?? 1500) + (players.black.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `Stockfish level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function process(bot, msg, mode) {
    tv(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.editReply(await tv(interaction.user, interaction.options.getString('mode')));
}

module.exports = {process, interact};
