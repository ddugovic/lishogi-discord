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
        .then(response => formatGame(response.data))
        .then(embed => { return { embeds: [ embed ] } })
        .catch(error => {
            console.log(`Error in playing(${author.username}): \
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

function formatGame(game) {
    const players = [game.players.white.user, game.players.black.user].map(formatPlayer).join(' - ');
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(game.players))
        .setAuthor({ name: players, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/${game.id}` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${title(game.perf)} game #${game.id}`)
        .setURL(`https://lichess.org/${game.id}`);
    if (game.status != 'started')
        embed = embed.setImage(`https://lichess1.org/game/export/gif/${game.id}.gif`);
    if (game.moves)
        embed = embed.setDescription(formatOpening(game.opening, game.moves));
    return embed;
}

function getColor(players) {
    const rating = (players.white.rating + players.black.rating) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    if (player.title)
        return `${player.title} ${player.name.split(' ')[0]}`;
    return player.name;
}

function formatOpening(opening, moves) {
    const ply = opening ? opening.ply : 10;
    const variation = moves.split(/ /).slice(0, ply);
    return opening ? `${opening.name}\n*${formatSanVariation(null, variation)}*` : `*${numberVariation(variation)}*`;
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
