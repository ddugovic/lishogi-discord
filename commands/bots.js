const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatCountry = require('../lib/format-country');
const { formatSocialLinks } = require('../lib/format-links');
const { formatSiteLink, getSiteLinks } = require('../lib/format-site-links');
const formatPages = require('../lib/format-pages');
const formatSeconds = require('../lib/format-seconds');
const parseDocument = require('../lib/parse-document');
const User = require('../models/User');

async function bots(author, interaction) {
    const mode = await getMode(author) || 'blitz';
    const url = 'https://lichess.org/api/bot/online?nb=50';
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/x-ndjson' }, params: { nb: 50 } })
        .then(response => { status = response.status; statusText = response.statusText; return response.text(); })
	.then(text => filter(parseDocument(text)))
        .then(bots => bots.map(bot => formatBot(bot, mode)))
        .then(embeds => formatPages(embeds, interaction, 'No bots are currently online.'))
        .catch(error => {
            console.log(`Error in bots(${author.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
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
    const [flag, firstName, lastName] = getFlagAndName(bot.profile) ?? [];
    var nickname = firstName ?? lastName ?? username;
    const name = (firstName && lastName) ? `${firstName} ${lastName}` : nickname;
    if (flag) {
        const countryName = formatCountry(flag);
        if (countryName)
            nickname = `${countryName} ${nickname}`;
    }

    const badges = bot.patron ? '🦄' : '';
    const embed = new EmbedBuilder()
        .setColor(getColor(getRating(bot.perfs, mode) ?? 1500))
        .setThumbnail('https://lichess1.org/assets/images/icons/bot.png')
        .setAuthor({name: `BOT ${name} ${badges}`, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: `https://lichess.org/@/${username}`})
        .setTitle(`:crossed_swords: Challenge ${nickname} to a game!`)
        .setURL(`https://lichess.org/?user=${bot.username}#friend`);
    return setAbout(embed, bot.username, bot.profile, bot.playTime);
}

function getFlagAndName(profile) {
    if (profile)
        return [profile.flag, profile.firstName, profile.lastName];
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
    const duration = formatSeconds(playTime ? playTime.tv : 0).split(/, /, 2)[0];
    const result = [`Time on :tv:: ${duration.replace('minutes','min.').replace('seconds','sec.')}`];
    const links = profile ? formatSocialLinks(`${profile.links} ${profile.bio}`) : [];
    if (profile && profile.bio)
        links.unshift(...getSiteLinks(profile.bio));
    if (links.length)
        result.push(links.join(' | '));
    if (profile && profile.bio) {
        const image = getImage(profile.bio);
        if (image)
            embed = embed.setThumbnail(image);
        const bio = profile.bio.replaceAll(/https\:\/\/(?:i\.)?imgur\.com\/\w+(?:\.\w+)?/g, '').split(/\s+/).map(formatSiteLink).join(' ');
        if (bio)
            result.push(bio);
    }
    return embed.addFields({ name: 'About', value: result.join('\n'), inline: true });
}

function getImage(text) {
    const match1 = text.match(/https:\/\/(?:i.)?imgur.com\/\w+\.\w+/);
    if (match1)
        return match1[0];
    const match2 = text.match(/https:\/\/(?:i.)?imgur.com\/\w+/);
    if (match2)
        return `${match2[0]}.png`;
}

function process(bot, msg, mode) {
    bots(msg.author, mode).then(message => msg.channel.send(message));
}

function interact(interaction) {
    bots(interaction.user, interaction);
}

module.exports = { process, interact };
