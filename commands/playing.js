const axios = require('axios');
const Discord = require('discord.js');
const User = require('../models/User');

async function playing(author, username) {
    if (!username) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.lichessName) {
            return 'You need to set your lichess username with setuser!';
        }
        username = user.lichessName;
    }
    const url = `https://lichess.org/api/user/${username}/current-game?moves=false&tags=false&clocks=false&evals=false`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatGame(response.data))
        .catch(error => {
            console.log(`Error in playing(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatGame(game) {
    if (game.status == 'started')
        return `https://lichess.org/${game.id}`;
    console.log(game);
    const players = [game.players.white.user, game.players.black.user].map(formatPlayer).join(' - ');
    var embed = new Discord.MessageEmbed()
        .setAuthor({ name: players, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/${game.id}` })
        .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${title(game.perf)} game #${game.id}`)
        .setURL(`https://lichess.org/${game.id}`)
        .setImage(`https://lichess1.org/game/export/gif/${game.id}.gif`);
    if (game.opening)
        embed = embed.setDescription(game.opening.name);
    return { embeds: [ embed ] };
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
