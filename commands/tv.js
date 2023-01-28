const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = 'https://lishogi.org/tv/channels';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => {
            if ((channel = getChannel(json, mode || 'Top Rated'))) {
                return formatChannel(...channel);
            }
        })
        .then(embed => { return embed ? { embeds: [ embed ] } : 'Channel not found!' })
        .catch(error => {
            console.log(`Error in tv(${author.username}, ${mode}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

async function getMode(author) {
    const user = await User.findById(author.id).exec();
    if (user && user.favoriteMode != 'puzzle')
        return user.favoriteMode;
}

function getChannel(data, mode) {
    for (const [channel, tv] of Object.entries(data)) {
        if (camel(channel).toLowerCase() == camel(mode).toLowerCase())
            return [channel == 'Top Rated' ? 'best' : camel(channel), channel, tv];
    }
}

function formatChannel(channel, name, tv) {
    const user = formatUser(tv.user);
    return new EmbedBuilder()
        .setColor(getColor(tv.rating))
        .setAuthor({name: user.replace(/\*\*/g, ''), iconURL: 'https://lishogi1.org/assets/logo/lishogi-favicon-32-invert.png', url: `https://lishogi.org/@/${tv.user.name}`})
        .setThumbnail(`https://lishogi1.org/game/export/gif/thumbnail/${tv.gameId}.gif`)
        .setTitle(`${name} :tv: ${user} (${tv.rating})`)
        .setURL(`https://lishogi.org/tv/${channel}`)
        .setDescription(`Sit back, relax, and watch the best ${name} games on Lishogi!`);
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `AI level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function camel(str) {
    str = str.split(/\W/)
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join('');
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function process(bot, msg, mode) {
    tv(msg.author, mode).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    await interaction.editReply(await tv(interaction.user, interaction.options.getString('mode')));
}

module.exports = {process, interact};
