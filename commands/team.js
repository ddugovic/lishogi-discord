const axios = require('axios');
const Discord = require('discord.js');
const headlineParser = require('eklem-headline-parser')
const formatColor = require('../lib/format-color');
const { formatLink, formatSocialLinks } = require('../lib/format-links');
const formatPages = require('../lib/format-pages');
const { formatUserLinks } = require('../lib/format-site-links');
const plural = require('plural');
const removeAccents = require('remove-accents');
const removeMarkdown = require("remove-markdown");
const lda = require('@stdlib/nlp-lda');
const stopwords = require('@stdlib/datasets-stopwords-en');

function team(author, text, interaction) {
    if (!text)
        return 'You need to specify text to search by!';
    text = text.replace(/\s+/, '');
    const url = `https://lishogi.org/api/team/search?text=${text}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setTeams(response.data, text, interaction))
        .catch(error => {
            console.log(`Error in team(${author.text}, ${text}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setTeams(teams, text, interaction) {
    text = removeAccents(text).toLowerCase();
    const description = cleanDescription(formatDescription(text));
    if (teams.nbResults) {
        teams.currentPageResults.forEach(team => team.score = score(team, description));
        teams = teams.currentPageResults.sort((a,b) => b.score - a.score);
        if (interaction)
            return formatPages(teams.map(formatTeam), interaction);
        return { embeds: [ formatTeam(teams[0]) ] };
    } else {
        return 'No team found.';
    }
}

function score(team, description) {
    console.log(team.name, description);
    const links = removeMarkdown(team.description)).matchAll(/(https?:\/\/[^\s]+)/g;
    const noise = [...links].reduce((partialSum, a) => partialSum + a[0].length, 0);
    const description = strip(removeMarkdown(team.description).replace(/(https?:\/\/[^\s]+)/g, ''));
    const docs = description.replaceAll(/[^\s\w]+/g, ' ').trim().split(/(?:\r?\n)+/);
    const topics = getTopics(docs, description);
    return team.nbMembers * (docs.length * 10 - noise) * topics.map(topic => scoreTopic(topic, description)).reduce((partialSum, a) => partialSum + a, 0);
}

function strip(description) {
    for (word of stopwords())
        description = description.replaceAll(` ${word} `, ' ');
    return description;
}

function getTopics(docs, text) {
    const model = lda(docs, 10);
    model.fit(1000, 100, 10)
    const topics = [];
    for (i = 0; i < 10; i++) { topics.push(model.getTerms(0, 20)); }
    return topics;
}

function scoreTopic(topic, text) {
    return topic.filter(term => term.word == text).map(term => term.prob)[0] ?? 0;
}

function formatTeam(team) {
    const count = Math.min(Math.max(Math.floor(team.nbMembers / 100), 0), 255);
    const description = formatDescription(team.description);
    return new Discord.MessageEmbed()
        .setColor(formatColor(count, 0, 255-count))
        .setThumbnail(getImage(team.description) ?? 'https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://lishogi.org/team/${team.id}`)
        .setDescription(cleanDescription(description))
        .addField(plural('Leader', team.leaders.length), team.leaders.map(formatLeader).join(', '));
}

function cleanDescription(description) {
    return description.split(/\r?\n/).map(formatUserLinks).map(formatLink).join('\n');
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
            continue;
        }
        about[i] = formatUserLinks(about[i]);
    }
    return about;
}

function getImage(text) {
    const match = text.match(/https:\/\/[-\.\w\/]+\/[-\w]+\.\w+/);
    if (match)
        return match[0];
}

function formatLeader(user) {
    return `[@${user.name}](https://lishogi.org/@/${user.name})`;
}

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return team(interaction.user, interaction.options.getString('text'), interaction);
}

module.exports = {process, interact};
