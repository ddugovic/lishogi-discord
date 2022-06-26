const axios = require('axios');
const Discord = require('discord.js');
const headlineParser = require('eklem-headline-parser')
const formatColor = require('../lib/format-color');
const removeAccents = require('remove-accents');
const removeMarkdown = require("remove-markdown");
const lda = require('@stdlib/nlp-lda');
const stopwords = require('@stdlib/datasets-stopwords-en');

async function team(author, text) {
    if (!text)
        return 'You need to specify text to search by!';
    text = text.replace(/\s+/, '');
    const url = `https://lichess.org/api/team/search?text=${text}`;
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
    const leader = getLeader(team.leader, team.leaders);
    const description = formatDescription(team.description);
    return new Discord.MessageEmbed()
        .setColor(formatColor(count, 0, 255-count))
        .setAuthor({name: leader.name, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getLink(leader.name)})
        .setThumbnail(getImage(team.description) ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://lichess.org/team/${team.id}`)
        .setDescription(description.split(/\r?\n/).map(formatLink).join('\n'));
}

function getLeader(leader, leaders) {
    if (leader in leaders) return leader;
    return leaders.length ? leaders[Math.floor(Math.random() * leaders.length)] : leader;
}

function getLink(name) {
    return `https://lichess.org/@/${name}`;
}

function formatDescription(text) {
    const image = /^(?:!\[.+?\]\(https?:.+?\))?([^]*)\r?\n!\[(?:[^\]]*?)\]\((https?:.+?)\)$/;
    const match = text.match(image);
    if (match)
        return formatDescription(match[1].trim());
    const result = [];
    for (link of getDiscord(text))
        result.push(`[Discord](https://${link})`);
    for (link of getMaiaChess(text))
        result.push(`[Maia Chess](https://${link})`);
    for (link of getTwitch(text))
        result.push(`[Twitch](https://${link})`);
    for (link of getYouTube(text))
        result.push(`[YouTube](https://${link})`);
    result.push(formatBio(text.split(/\r?\n/)));
    return result.join('\n');
}

function formatLink(text) {
    text = text.split(/ +/).map(formatUser).join(' ');
    const pattern = /^([- \w]+)(?::\s+|\s+-\s+)(https?:\/\/[-\w\.\/]+)$/;
    const match = text.match(pattern);
    if (match)
        return `[${match[1]}](${match[2]})`;
    return text;
}

function getDiscord(links) {
    const pattern = /discord.gg\/\w{7,8}/g;
    return links.matchAll(pattern);
}

function getMaiaChess(links) {
    const pattern = /maiachess.com/g;
    return links.matchAll(pattern);
}

function getTwitch(links) {
    const pattern = /twitch.tv\/\w{4,25}/g;
    return links.matchAll(pattern);
}

function getYouTube(links) {
    // https://stackoverflow.com/a/65726047
    const pattern = /youtube\.com\/(?:channel\/UC[\w-]{21}[AQgw]|(?:c\/|user\/)?[\w-]+)/g
    return links.matchAll(pattern);
}

function formatUser(text) {
    var username = /^(?:https:\/\/lichess\.org\/@\/|@)(\w+)$/;
    var match = text.match(username);
    if (match)
        return `[@${match[1]}](https://lichess.org/@/${match[1]})`;

    user = /\[(\w+)\]\(https:\/\/lichess\.org\/@\/\1\/?\)/;
    match = text.match(user);
    if (match)
        return text.replace(match[0], `[@${match[1]}](https://lichess.org/@/${match[1]})`);
    return text;
}

function formatBio(bio) {
    const social = /\bdiscord\.gg\b|\bmedia\.giphy\.com\b|\btwitch\.tv\b|\byoutube\.com\b|\byoutu\.be\b/i;
    const username = /@(\w+)/g;
    for (let i = 0; i < bio.length; i++) {
        if (bio[i].match(social)) {
            bio.splice(i, 1);
            i -= 1;
            continue;
        }
        for (match of bio[i].matchAll(username)) {
            bio[i] = bio[i].replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);
        }
    }
    return bio.join('\n');
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
