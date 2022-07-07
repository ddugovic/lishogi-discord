const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        username = await getName(author);
        if (!username)
            return 'You need to set your lishogi username with setuser!';
    }
    const url = `https://lishogi.org/api/user/${username}/current-game?moves=false&tags=false&clocks=false&evals=false`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatGame(response.data))
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
        return user.lishogiName;
}

function formatGame(game) {
    if (game.status == 'started')
        return `https://lishogi.org/${game.id}`;
    const players = [game.players.sente.user, game.players.gote.user].map(formatPlayer).join(' - ');
    var embed = new Discord.MessageEmbed()
        .setColor(getColor(game.players))
        .setAuthor({ name: players, iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: `https://lishogi.org/${game.id}` })
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(`${title(game.perf)} game #${game.id}`)
        .setURL(`https://lishogi.org/${game.id}`)
        .setImage(`https://lishogi1.org/game/export/gif/${game.id}.gif`);
    if (game.opening)
        embed = embed.setDescription(game.opening.name);
    return { embeds: [ embed ] };
}

function getColor(players) {
    const rating = (players.sente.rating + players.gote.rating) / 2;
    const red = Math.min(Math.max(Math.floor((rating - 1500) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    if (player.title)
        return `${player.title} ${player.name.split(' ')[0]}`;
    return player.name;
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
