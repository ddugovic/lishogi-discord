const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatFlag = require('../lib/format-flag');
const formatPages = require('../lib/format-pages');
const timestamp = require('unix-timestamp');
const User = require('../models/User');

async function recent(author, username, interaction) {
    if (!username) {
        const user = await User.findById(author.id).exec();
        if (!user || !user.wooglesName)
            return interaction ? await interaction.editReply('You need to set your Woogles.io username with setuser!') : 'You need to set your Woogles.io username with setuser!';
        username = user.wooglesName;
    }
    const url = `https://woogles.io/twirp/game_service.GameMetadataService/GetRecentGames`;
    const request = { username: username, numGames: 10, offset: 0 };
    const headers = { authority: 'woogles.io', accept: 'application/json', origin: 'https://woogles.io' };
    return axios.post(url, request, { headers: headers })
        .then(response => formatPages(response.data.game_info.map(formatGame), interaction, 'No games found!'))
        .catch(error => {
            console.log(`Error in recent(${author.username}, ${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatGame(info) {
    return new EmbedBuilder()
        .setTitle(info.players.map(formatPlayer).join(' - '))
        .setURL(`https://woogles.io/game/${info.game_id}`)
        .setThumbnail('https://woogles.io/logo192.png')
	.setImage(`https://woogles.io/gameimg/${info.game_id}-v2-a.gif`)
        .setDescription(`<t:${Math.round(timestamp.fromDate(info.created_at))}>`);
}

function formatPlayer(player) {
    var name = player.nickname;
    if (player.country_code) {
        const flag = formatFlag(player.country_code.toUpperCase());
        if (flag)
            name = `${flag} ${name}`;
    }
    if (player.title)
        name = `${player.title} ${name}`;
    return name;
}

function process(bot, msg, username) {
    recent(msg.author, username).then(message => msg.channel.send(message));
}

function interact(interaction) {
    recent(interaction.user, interaction.options.getString('username'), interaction);
}

module.exports = { process, interact };
