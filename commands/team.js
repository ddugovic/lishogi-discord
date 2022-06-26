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
    const count = Math.min(Math.max(team.nbMembers, 0), 255);
    const leader = getLeader(team.leader, team.leaders);
    const [description, imageURL, images] = formatDescription(team.description);
    var embed = new Discord.MessageEmbed()
        .setColor(formatColor(count, 0, 255-count))
        .setAuthor({name: leader.name, iconURL: 'https://playstrategy.org/assets/logo/playstrategy-favicon-32-invert.png', url: getLink(leader.name)})
        .setThumbnail(imageURL ?? 'https://playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://playstrategy.org/team/${team.id}`)
        .setDescription(description.split(/\r?\n/).map(formatLink).join('\n'));
    if (images.length)
        embed = embed.setImage(images[0]);
    return embed;
}

function getLeader(leader, leaders) {
    if (leader in leaders) return leader;
    return leaders.length ? leaders[Math.floor(Math.random() * leaders.length)] : leader;
}

function getLink(name) {
    return `https://playstrategy.org/@/${name}`;
}

function formatDescription(text) {
    const [description, images] = getImages(text, []);
    const logo = /^!\[[- \w]+\]\((https?:.*?)\)\s+([^]*)$/;
    const match = description.match(logo);
    if (match)
        return [match[2], match[1], images];
    return [description, null, images];
}

function getImages(text, images) {
    const image = /^([^]*)\r?\n!\[(?:[^\]]*?)\]\((https?:.*?)\)$/;
    const match = text.match(image);
    if (match) {
        images.unshift(match[2]);
        return getImages(match[1].trim(), images);
    }
    return [text, images];
}

function formatLink(text) {
    text = text.split(/ +/).map(formatUser).join(' ');
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

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return team(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
