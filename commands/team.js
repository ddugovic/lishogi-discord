const axios = require('axios');
const Discord = require('discord.js');
const similarity = require("string-similarity");

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
    if (teams.nbResults) {
        const team = teams.currentPageResults.sort((a,b) => score(b, text) - score(a, text))[0];
        return { embeds: [ formatTeam(team) ] };
    } else {
        return 'No team found.';
    }
}

function score(team, text) {
    const description = formatDescription(team.description)[0];
    return team.nbMembers * (similarity.compareTwoStrings(team.name, text) * 4 + similarity.compareTwoStrings(description, text));
}

function formatTeam(team) {
    const [description, imageURL, images] = formatDescription(team.description);
    var embed = new Discord.MessageEmbed()
        .setAuthor({name: team.leader.name, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getLink(team.leader.name)})
        .setThumbnail(imageURL ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://lichess.org/team/${team.id}`)
        .setDescription(description.split(/\r?\n/).map(formatLink).join('\n'));
    if (images.length)
        embed = embed.setImage(images[0]);
    return embed;
}

function getLink(name) {
    return `https://lichess.org/@/${name}`;
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

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return team(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
