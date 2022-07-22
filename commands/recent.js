const axios = require('axios');
const Discord = require('discord.js');
const timestamp = require('unix-timestamp');
const User = require('../models/User');

async function recent(author, username) {
    if (!username) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.wooglesName) {
            return 'You need to set your woogles username with setuser!';
        }
        username = user.wooglesName;
    }
    const url = `https://woogles.io/twirp/game_service.GameMetadataService/GetRecentGames`;
    const request = {
        'username': username,
        'numGames': 1,
        'offset': 0
    };
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, request, {headers: context})
        .then(response => formatGames(response.data))
        .catch(error => {
            console.log(`Error in recent(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatGames(data) {
    for (info of data.game_info) {
        const embed = new Discord.EmbedBuilder()
            .setTitle(info.players.map(formatPlayer).join(' - '))
            .setURL(`https://woogles.io/game/${info.game_id}`)
            .setThumbnail('https://woogles.io/logo192.png')
	    .setImage(`https://woogles.io/gameimg/${info.game_id}-v2-a.gif`)
            .setDescription(`<t:${Math.round(timestamp.fromDate(info.created_at))}>`);
        return { embeds: [ embed ] };

        return `https://woogles.io/${info.game_id}`;
    }
    return 'No games found!';
}

function formatPlayer(player) {
    if (player.title)
        return `${player.title} ${player.nickname}`;
    return player.nickname;
}

function process(bot, msg, username) {
    recent(msg.author, username).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    interaction.editReply(await recent(interaction.user, interaction.options.getString('username')));
}

module.exports = {process, interact};
