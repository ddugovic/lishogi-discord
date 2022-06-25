const axios = require('axios');
const Discord = require('discord.js');

async function team(author, text) {
    if (!text)
        return 'You need to specify text to search by!';
    const url = `https://lichess.org/api/team/search?text=${text}&nb=1`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => setTeams(response.data))
        .catch(error => {
            console.log(`Error in team(${author.text}, ${text}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function setTeams(teams) {
    if (teams.nbResults) {
        return { embeds: [ teams.currentPageResults.slice(0, 1).map(formatTeam)[0] ] };
    } else {
        return 'No team found.';
    }
}

function formatTeam(team) {
    const [description, imageURL] = formatDescription(team.description);
    return new Discord.MessageEmbed()
        .setAuthor({name: team.leader.name, iconURL: 'https://lichess1.org/assets/logo/lichess-favicon-32-invert.png', url: getLink(team.leader.name)})
        .setThumbnail(imageURL ?? 'https://lichess1.org/assets/logo/lichess-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://lichess.org/team/${team.id}`)
        .setDescription(description.split(/\r?\n/).map(formatLink).join('\n'));
}

function getLink(name) {
    return `https://lichess.org/@/${name}`;
}

function formatDescription(description) {
    const pattern = /^!\[[- \w]+\]\((.*)\)\s+([^]*)$/;
    const match = description.match(pattern);
    if (match)
        return [match[2], match[1]];
    return [description, null];
}

function formatLink(text) {
    const pattern = /^([- \w]+):\s+(https?:\/\/[-\w\.\/]+)$/;
    const match = text.match(pattern);
    if (match)
        return `[${match[1]}](${match[2]})`;
    return text;
}

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return team(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
