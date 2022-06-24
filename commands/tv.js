const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = 'https://lichess.org/tv/channels';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatTv(response.data, mode ?? 'blitz'))
        .catch(error => {
            console.log(`Error in tv(${author.username}, ${mode}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.favoriteMode;
}

function formatTv(data, mode) {
    for (const [channel, tv] of Object.entries(data)) {
        if (channel.toLowerCase() == mode.toLowerCase()) {
            const user = formatUser(tv.user);
            const embed = new Discord.MessageEmbed()
                .setColor(getColor(tv.rating))
                .setAuthor({name: user, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png'})
                .setThumbnail('https://lichess1.org/assets/logo/lichess-favicon-64.png')
                .setTitle(`${channel} • ${user}`)
                .setURL(`https://lichess.org/tv/${channel.toLowerCase()}`)
                .setImage(`https://lichess1.org/game/export/gif/${tv.gameId}.gif`);
            return { embeds: [ embed ] };
        }
    }
    return `Channel not found!`;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatUser(user) {
    return user.title ? `${user.title} ${user.name}` : user.name;
}

function process(bot, msg, mode) {
    tv(msg.author, mode).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return tv(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
