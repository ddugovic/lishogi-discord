const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatSanVariation, numberVariation } = require('../lib/format-variation');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lichess username with setuser!';
    }
    const url = `https://lichess.org/api/user/${username}/current-game?evals=false`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatCurrentGame(response.data))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in playing(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getName(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.lichessName;
}

function formatCurrentGame(game) {
    const players = [game.players.white, game.players.black].map(formatPlayer).join(' - ');
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(game.players))
        .setAuthor({ name: players, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/${game.id}` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${title(game.perf)} game #${game.id}`)
        .setURL(`https://lichess.org/${game.id}`)
        .setDescription(formatGame(game));
    if (game.status != 'started')
        embed = embed.setImage(`https://lichess1.org/game/export/gif/${game.id}.gif`);
    return embed;
}

function getColor(players) {
    const rating = ((players.white.rating ?? 1500) + (players.black.rating ?? 1500)) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `Stockfish level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function formatGame(game) {
    const opening = game.moves ? ` ${formatOpening(game.opening, game.initialFen, game.moves)}` : '';
    return `${formatClock(game.clock, game.daysPerTurn)} <t:${Math.floor(game.createdAt / 1000)}:R>${opening}`;
}

function formatOpening(opening, initialFen, moves) {
    const variation = moves.split(/ /).slice(0, opening ? opening.ply : 10);
    return opening ? `${opening.name}\n*${formatSanVariation(initialFen, variation)}*` : `*${numberVariation(variation)}*`;
}

function formatClock(clock, daysPerTurn) {
    if (clock) {
        const base = clock.initial == 15 ? '¼' : clock.initial == 30 ? '½' : clock.initial == 45 ? '¾' : clock.initial / 60;
        return `${base}+${clock.increment}`;
    }
    return daysPerTurn ? `${daysPerTurn} ${plural('day', daysPerTurn)}` : '∞';
}

function title(str) {
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

function process(bot, msg, username) {
    playing(msg.author, username).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return playing(interaction.user, interaction.options.getString('username'));
}

module.exports = {process, reply};
