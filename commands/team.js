const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatSocialLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');
const { formatSiteLinks } = require('../lib/format-site-links');
const fn = require('friendly-numbers');
const { escape } = require('querystring')
const plural = require('plural');

function team(author, text, interaction) {
    if (!text)
        return 'You need to specify text to search by!';
    const url = `https://lichess.org/api/team/search?text=${escape(text)}`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' }, params: { text: text } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => json.currentPageResults.map(formatTeam))
        .then(embeds => formatPages(embeds, interaction, 'No team found.'))
        .catch(error => {
            console.log(`Error in team(${author.username}, ${text}): ${error}`);
            return formatError(status, statusText, `${url} failed to respond`);
        });
}

function formatTeam(team) {
    const count = Math.min(Math.max(Math.floor(team.nbMembers / 100), 0), 255);
    const description = formatDescription(team.description);
    var embed = new EmbedBuilder()
        .setColor(formatColor(count, 0, 255-count))
        .setThumbnail(getImage(team.description) ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://lichess.org/team/${team.id}`)
        .setDescription(cleanDescription(description))
        .addFields({ name: 'Members', value: `**${fn.format(team.nbMembers)}**`, inline: true });
    if (team.leaders.length)
        embed = embed.addFields({ name: plural('Leader', team.leaders.length), value: team.leaders.map(formatLeader).join(', '), inline: true });
    return embed;
}

function cleanDescription(description) {
    const lines = description.split(/\r?\n/).map(formatSiteLinks);
    while (lines.join('\n').length > 4000)
        lines.pop();
    return lines.join('\n');
}

function formatDescription(text) {
    const image = /^(?:!\[.+?\]\(https?:.+?\))?([^]*)\r?\n!\[(?:[^\]]*?)\]\((https?:.+?)\)$/;
    const match = text.match(image);
    if (match)
        return formatDescription(match[1].trim());
    const links = formatSocialLinks(text);
    const result = links.length ? [links.join(' | ')] : [];
    result.push(formatAbout(text.split(/\r?\n/)).join('\n'));
    return result.join('\n');
}

function formatAbout(about) {
    const social = /\bdiscord\.gg\b|\bmedia\.giphy\.com\b|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < about.length; i++) {
        if (about[i].match(social)) {
            about.splice(i, 1);
            i -= 1;
        }
    }
    return about;
}

function getImage(text) {
    const match = text.match(/https:\/\/[-\.\w\/]+\/[-\w]+\.(?:gifv?|jpe?g|png)/i);
    if (match)
        return match[0];
}

function formatLeader(user) {
    return `[@${user.name}](https://lichess.org/@/${user.name})`;
}

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return team(interaction.user, interaction.options.getString('text'), interaction);
}

module.exports = {process, interact};
