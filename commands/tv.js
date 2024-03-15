const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatColor = require('../lib/format-color');
const { formatHandicap, formatVariant } = require('../lib/format-variant');
const { formatSanVariation, numberVariation } = require('../lib/format-variation');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode)
        mode = await getMode(author) ?? 'standard';
    let status, statusText;
    return fetch('https://lishogi.org/api/tv/channels')
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(games => {
            const game = games[mode];
            return formatChannel(mode ?? 'best', formatVariant(mode ?? 'Top Rated'), game);
            //return embed.addFields({ name: 'Live Games', value: games.map(formatGame).join('\n') });
        })
        .then(embed => { return embed ? { embeds: [ embed ] } : 'Channel not found!' })
        .catch(error => {
            console.log(`Error in tv(${author.username}, ${mode}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user && user.favoriteMode in ['annanshogi','checkshogi','chushogi','kyotoshogi','minishogi','computer'])
        return user.favoriteMode;
}

function formatChannel(channel, name, game) {
    return new EmbedBuilder()
        .setColor(getColor(game))
        .setThumbnail(`https://lishogi1.org/game/export/gif/thumbnail/${game.gameId}.gif`)
        .setTitle(`${name} :tv: ${formatPlayer(game)}`)
        .setURL(`https://lishogi.org/tv/${channel}`)
        .setDescription(`Sit back, relax, and watch the best ${name} games on Lishogi!`);
}

function formatGame(game) {
    const url = `https://lishogi.org/${game.id}`;
    const players = [game.players.sente, game.players.gote].map(formatPlayer).join(' - ');
    const opening = game.moves ? `\n${formatOpening(game.opening, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} [${players}](${url})${opening}`;
}

function formatOpening(opening, moves) {
    const ply = opening ? opening.ply : 10;
    const variation = moves.split(/ /).slice(0, ply);
    return opening ? `${opening.name} *${formatSanVariation(null, variation)}*` : `*${numberVariation(variation)}*`;
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

function process(bot, msg, mode) {
    tv(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    await interaction.editReply(await tv(interaction.user, interaction.options.getString('mode')));
}

module.exports = {process, interact};
