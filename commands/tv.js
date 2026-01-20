const { EmbedBuilder } = require('discord.js');
const plural = require('plural');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const { formatChunks } = require('../lib/format-pages');
const { formatHandicap, formatVariant } = require('../lib/format-variant');
const { formatOpening } = require('../lib/format-variation');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

function tv(mode, interaction) {
    if (!mode)
        mode = 'standard';
    let status, statusText;
    return fetch('https://lishogi.org/api/tv/channels')
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(channels => {
            const channel = channels[mode];
            if (channel) { return formatChannel(mode ?? 'best', formatVariant(mode ?? 'Top Rated'), channel); }
        })
        .then(embed => formatChunks([embed], interaction, 'Channel not found!'))
        .catch(error => {
            console.log(`Error in tv(${mode}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

async function formatChannel(mode, name, channel) {
    var embed = new EmbedBuilder()
        .setColor(getColor(channel))
        .setThumbnail(`https://lishogi1.org/game/export/gif/thumbnail/${channel.gameId}.gif`)
        .setTitle(`${name} :tv: ${formatPlayer(channel)}`)
        .setURL(`https://lishogi.org/tv/${mode}`)
        .setDescription(`Sit back, relax, and watch the best ${name} games on Lishogi!`);

    const requests = [getGame(channel.gameId), getLiveGames(mode)];
    const [game, games] = await Promise.all(requests);
    if (games.length) {
        const fields = await Promise.all(games.filter(game => game.status != 'aborted').map(formatGame));
        embed = embed.addFields({ name: `Live ${plural('Game', fields.length)}`, value: fields.join('\n') });
    } else if (game.length) {
        const field = await formatGame(game[0]);
        embed = embed.addFields({ name: 'Recent Game', value: field });
    }
    return embed;
}

function getGame(gameId) {
    const url = `https://lishogi.org/game/export/${gameId}`;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { clocks: 'false', evals: 'false', opening: 'true' } })
        .then(response => response.text())
        .then(json => parseDocument(json));
}

function getLiveGames(channel) {
    const url = `https://lishogi.org/api/tv/${channel ?? 'best'}?clocks=false&nb=3`;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' }, params: { nb: 3 } })
        .then(response => response.text())
        .then(text => parseDocument(text));
}

async function formatGame(game) {
    const handicap = await formatHandicap(game.variant, game.initialSfen);
    const winner = game.winner ? game.players[`${game.winner}`].user : undefined;
    const players = [game.players.sente, game.players.gote].map(formatPlayer).join(' - ');
    const url = `https://lishogi.org/${game.id}`;
    const status = formatStatus(game);
    const opening = game.moves ? `${await formatOpening(game.variant, game.opening, game.initialSfen, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} ${status[0]} [${players}](${url}) ${status[1]} (${handicap}) <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatRatingDiff(ratingDiff) {
    return (ratingDiff > 0) ? ` ▲**${ratingDiff}**` : (ratingDiff < 0) ? ` ▼**${Math.abs(ratingDiff)}**` : '';
}

function formatStatus(game) {
    return [game.players.sente.ratingDiff, game.players.gote.ratingDiff].map(formatRatingDiff);
}

function getColor(game) {
    const rating = game.rating ?? 1500;
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `AI level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function getMode(user) {
    if (user && user.favoriteMode in ['annanshogi','checkshogi','chushogi','kyotoshogi','minishogi','computer'])
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
