const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatThumbnailURL } = require('../lib/format-site-links');
const formatVariant = require('../lib/format-variant');
const { formatOpening } = require('../lib/format-variation');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

function tv(mode, interaction) {
    const url = `https://lichess.org/api/tv/${mode ?? 'best'}?clocks=false&nb=3&opening=true`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' }, params: { nb: 3, opening: true } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
        .then(text => parseDocument(text))
        .then(games => formatTv(games, mode))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in tv(${mode}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

async function formatTv(games, mode) {
    const embed = formatChannel(mode ?? 'best', formatVariant(mode ?? 'Top Rated'), games[0]);
    const fields = await Promise.all(games.filter(game => game.status != 'aborted').map(formatGame));
    return embed.addFields({ name: 'Live Games', value: fields.join('\n\n') });
}

function formatChannel(channel, name, game) {
    const players = [game.players.white, game.players.black];
    return new EmbedBuilder()
        .setColor(getColor(game.players))
        .setThumbnail(formatThumbnailURL(game.id))
        .setTitle(`${name} :tv: ${players.map(formatPlayer).join(' - ')}`)
        .setURL(`https://lichess.org/tv/${channel}`)
        .setDescription(`Sit back, relax, and watch the best ${name} games on Lichess!`);
}

async function formatGame(game) {
    const url = `https://lichess.org/${game.id}`;
    const players = [game.players.white, game.players.black].map(formatPlayer).join(' - ');
    const opening = game.moves ? `\n${await formatOpening(game.opening, null, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} [${players}](${url})${opening}`;
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

function getMode(user) {
    if (user && user.favoriteMode != 'puzzle')
        return user.favoriteMode;
}

async function process(bot, msg, mode) {
    const user = await User.findById(msg.author.id).exec();
    tv(mode || getMode(user)).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const user = await User.findById(interaction.user.id).exec();
    const mode = interaction.options.getString('mode') || getMode(user);
    return tv(mode, interaction);
}

module.exports = {process, interact};
