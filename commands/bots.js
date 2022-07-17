const axios = require('axios');
const Discord = require('discord.js');
const flags = require('emoji-flags');
const formatColor = require('../lib/format-color');
const { formatSocialLinks } = require('../lib/format-links');
const { formatSiteLink } = require('../lib/format-site-links');
const formatPages = require('../lib/format-pages');
const formatSeconds = require('../lib/format-seconds');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function bots(author, interaction) {
    const mode = await getMode(author) || 'blitz';
    return axios.get('https://lichess.org/api/bot/online?nb=50', { headers: { Accept: 'application/x-ndjson' } })
        .then(response => filter(parseDocument(response.data)))
        .then(bots => bots.map(bot => formatBot(bot, mode)))
        .then(embeds => formatPages(embeds, interaction, 'No bots are currently online.'))
        .catch(error => {
            console.log(`Error in bots(${author.username}, ${mode}): \
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

function filter(bots) {
    return bots.filter(bot => !bot.tosViolation && source(bot.profile)).sort((a, b) => a.seenAt - b.seenAt);
}

function source(profile) {
    const git = /\bgit(?:hub|lab)?\b/;
    if (profile && profile.links)
        return profile.links.match(git);
}

function formatBot(bot, mode) {
    const username = bot.username;
    const [country, firstName, lastName] = getCountryAndName(bot.profile) ?? [];
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (country && flags.countryCode(country))
        nickname = `${flags.countryCode(country).emoji} ${nickname}`;

    const badges = bot.patron ? '🦄' : '';
    const embed = new Discord.MessageEmbed()
        .setColor(getColor(getRating(bot.perfs, mode) ?? 1500))
        .setThumbnail('https://lichess1.org/assets/images/icons/bot.png')
        .setAuthor({name: `BOT ${name} ${badges}`, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${username}`})
        .setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lichess.org/?user=${bot.username}#friend`);
    return setAbout(embed, bot.username, bot.profile, bot.playTime);
}

function getCountryAndName(profile) {
    if (profile)
        return [profile.country, profile.firstName, profile.lastName];
}

function getRating(perfs, mode) {
    if (perfs && perfs[mode])
        return perfs[mode].rating;
}

function getColor(rating) {
    const red = Math.min(Math.max(Math.floor((rating - 2000) / 4), 0), 255);
    return formatColor(red, 0, 255-red);
}

function setAbout(embed, username, profile, playTime) {
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(', ')[0];
    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    const links = profile ? formatSocialLinks(`${profile.links} ${profile.bio}`) : [];
    if (links.length)
        result.push(links.join(' | '));
    if (profile && profile.bio) {
        const image = getImage(profile.bio);
        if (image)
            embed = embed.setThumbnail(image);
        const bio = profile.bio.split(/\s+/).map(formatSiteLink).join(' ');
        if (bio)
            result.push(bio);
    }
    return embed.addField('About', result.join('\n'), true);
}

function getImage(text) {
    const match = text.match(/https:\/\/(?:i.)?imgur.com\/\w+(?:.\w+)?/);
    if (match)
        return match[0];
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    bots(interaction.user, interaction);
}

module.exports = { process, interact };
