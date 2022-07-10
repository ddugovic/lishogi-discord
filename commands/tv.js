const axios = require('axios');
const Discord = require('discord.js');
const formatColor = require('../lib/format-color');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function tv(author, mode) {
    if (!mode)
        mode = await getMode(author);
    const url = 'https://lichess.org/tv/channels';
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => getChannel(response.data, mode ?? 'blitz'))
        .then(channel => { if (channel) return formatChannel(...channel); })
        .then(embed => { return embed ? { embeds: [ embed ] } : 'Channel not found!' })
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

function getChannel(data, mode) {
    for (const [channel, tv] of Object.entries(data))
        if (camel(channel).toLowerCase() == camel(mode).toLowerCase())
            return [channel, tv];
}

function formatChannel(channel, tv) {
    const user = formatUser(tv.user);
    const embed = new Discord.MessageEmbed()
        .setColor(getColor(tv.rating))
        .setAuthor({name: user.replace(/\*\*/g, ''), iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${tv.user.name}`})
        .setThumbnail(channel == 'Computer' ? 'https://images.prismic.io/lichess/79740e75620f12fcf08a72cf7caa8bac118484d2.png?auto=compress,format' : 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(`${channel} :tv: ${user} (${tv.rating})`)
        .setURL(`https://lichess.org/tv/${camel(channel)}`)
        .setDescription(`Sit back, relax, and watch the best ${channel} players compete on Lichess TV`);
    return setGames(embed, channel);
}

function setGames(embed, channel) {
    const url = `https://lichess.org/api/tv/${camel(channel)}?nb=3&opening=true`;
    return axios.get(url, { headers: { Accept: 'application/x-ndjson' } })
        .then(response => parseDocument(response.data))
        .then(games => { return embed.addField('Live Games', games.map(formatGame).join('\n\n')) });
}

function formatGame(game) {
    const url = `https://lichess.org/${game.id}`;
    const players = [game.players.white, game.players.black].map(formatPlayer).join(' - ');
    const opening = game.moves ? `\n${formatOpening(game.variant, game.opening, game.moves)}` : '';
    return `${formatClock(game.clock)} [${players}](${url})${opening}`;
}

function formatOpening(variant, opening, moves) {
    const ply = variant == 'standard' ? opening.ply : 10;
    const line = moves.replaceAll(/\*/g, '\\*').split(/ /).slice(0, ply).join(' ');
    return variant == 'standard' ? `${opening.name} *${line}*` : `*${line}*`;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 2), 0), 255);
    return formatColor(red, 0, 255-red);
}

function formatPlayer(player) {
    return player.user ? formatUser(player.user) : player.aiLevel ? `Stockfish level ${player.aiLevel}` : 'Anonymous';
}

function formatUser(user) {
    return user.title ? `**${user.title}** ${user.name}` : user.name;
}

function formatClock(clock) {
    const base = clock.initial == 15 ? '¼' : clock.initial == 30 ? '½' : clock.initial == 45 ? '¾' : clock.initial / 60;
    return `${base}+${clock.increment}`;
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

async function reply(interaction) {
    return tv(interaction.user, interaction.options.getString('mode'));
}

module.exports = {process, reply};
