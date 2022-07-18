const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatSocialLinks } = require('../lib/format-links');
const { formatUserLink, formatUserLinks } = require('../lib/format-site-links');
const formatPages = require('../lib/format-pages');
const plural = require('plural');

function team(author, text, interaction) {
    if (!text)
        return 'You need to specify text to search by!';
    text = text.replace(/\s+/, '');
    const url = `https://lidraughts.org/api/team/search?text=${text}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => response.data.currentPageResults.map(formatTeam))
        .then(embeds => formatPages(embeds, interaction, 'No team found.'))
        .catch(error => {
            console.log(`Error in team(${author.text}, ${text}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatTeam(team) {
    const count = Math.min(Math.max(Math.floor(team.nbMembers / 100), 0), 255);
    const description = formatDescription(team.description);
    return new EmbedBuilder()
        .setColor(formatColor(count, 0, 255-count))
        .setThumbnail(getImage(team.description) ?? 'https://lidraughts.org/assets/favicon.64.png')
        .setTitle(team.name)
        .setURL(`https://lidraughts.org/team/${team.id}`)
        .setDescription(description.split(/\r?\n/).map(formatLink).join('\n'))
        .addField(plural('Leader', team.leaders.length), team.leaders.map(formatLeader).join(', '));
}

function formatLeader(user) {
    return `[@${user.name}](https://lidraughts.org/@/${user.name})`;
}

function formatDescription(text) {
    const image = /^(?:!\[.+?\]\(https?:.+?\))?([^]*)\r?\n!\[(?:[^\]]*?)\]\((https?:.+?)\)$/;
    const match = text.match(image);
    if (match)
        return formatDescription(match[1].trim());
    const links = formatSocialLinks(text);
    const result = links.length ? [links.join(' | ')] : [];
    result.push(formatAbout(text.split(/\r?\n/)));
    return result.join('\n');
}

function formatLink(text) {
    text = formatUserLink(text);
    const pattern = /^([- \w]+)(?::\s+|\s+-\s+)(https?:\/\/[-\w\.\/]+)$/;
    const match = text.match(pattern);
    if (match)
        return `[${match[1]}](${match[2]})`;
    return text;
}

function formatAbout(about) {
    const social = /\bdiscord\.gg\b|\bmedia\.giphy\.com\b|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    for (let i = 0; i < about.length; i++) {
        if (about[i].match(social)) {
            about.splice(i, 1);
            i -= 1;
            continue;
        }
        bio[i] = formatUserLinks(bio[i]);
    }
    return about.join('\n');
}

function getImage(text) {
    const match = text.match(/https:\/\/[-\.\w\/]+\/[-\w]+\.\w+/);
    if (match)
        return match[0];
}

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

function interact(interaction) {
    team(interaction.user, interaction.options.getString('text'), interaction);
}

module.exports = {process, interact};
