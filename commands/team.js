const axios = require('axios');
const Discord = require('discord.js');
const headlineParser = require('eklem-headline-parser')
const formatColor = require('../lib/format-color');
const { formatSocialLinks } = require('../lib/format-links');
const plural = require('plural');
const removeAccents = require('remove-accents');
const removeMarkdown = require("remove-markdown");
const lda = require('@stdlib/nlp-lda');
const stopwords = require('@stdlib/datasets-stopwords-en');

async function team(author, text) {
    if (!text)
        return 'You need to specify text to search by!';
    text = text.replace(/\s+/, '');
    const url = `https://playstrategy.org/api/team/search?text=${text}`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setTeams(response.data, text))
        .catch(error => {
            console.log(`Error in team(${author.text}, ${text}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setTeams(teams, text) {
    text = removeAccents(text).toLowerCase();
    if (teams.nbResults) {
        teams.currentPageResults.forEach(team => team.score = score(team, text));
        const team = teams.currentPageResults.sort((a,b) => b.score - a.score)[0];
        return { embeds: [ formatTeam(team) ] };
    } else {
        return 'No team found.';
    }
}

function score(team, text) {
    const description = strip(removeAccents(removeMarkdown(team.description)).toLowerCase());
    const docs = description.replaceAll(/[^\s\w]+/g, ' ').trim().split(/(?:\r?\n)+/);
    const topics = getTopics(docs, text);
    return team.nbMembers * docs.length * topics.map(topic => scoreTopic(topic, text)).reduce((partialSum, a) => partialSum + a, 0);
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
        .setThumbnail(getImage(team.description) ?? 'https://playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://playstrategy.org/team/${team.id}`)
        .setDescription(description.split(/\r?\n/).map(formatLink).join('\n'))
        .addField(plural('Leader', team.leaders.length), team.leaders.map(formatLeader).join(', '));
}

function formatLeader(user) {
    return `[@${user.name}](https://playstrategy.org/@/${user.name})`;
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
    text = formatUser(text);
    const pattern = /^([- \w]+)(?::\s+|\s+-\s+)(https?:\/\/[-\w\.\/]+)$/;
    const match = text.match(pattern);
    if (match)
        return `[${match[1]}](${match[2]})`;
    return text;
}

function formatUser(text) {
    var username = /^(?:https:\/\/playstrategy\.org\/@\/|@)(\w+)$/;
    var match = text.match(username);
    if (match)
        return `[@${match[1]}](https://playstrategy.org/@/${match[1]})`;

    user = /\[(\w+)\]\(https:\/\/playstrategy\.org\/@\/\1\/?\)/;
    match = text.match(user);
    if (match)
        return text.replace(match[0], `[@${match[1]}](https://playstrategy.org/@/${match[1]})`);
    return text;
}

function formatAbout(about) {
    const social = /\bdiscord\.gg\b|\bmedia\.giphy\.com\b|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    const username = /@(\w+)/g;
    for (let i = 0; i < about.length; i++) {
        if (about[i].match(social)) {
            about.splice(i, 1);
            i -= 1;
            continue;
        }
        for (match of about[i].matchAll(username))
            about[i] = about[i].replace(match[0], `[${match[0]}](https://playstrategy.org/@/${match[1]})`);
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

async function reply(interaction) {
    return team(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
