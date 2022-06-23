const axios = require('axios');
const Discord = require('discord.js');

async function team(author, text) {
    if (!text)
        return 'You need to specify text to search by!';
    const url = `https://playstrategy.org/api/team/search?text=${text}&nb=1`;
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
        return { embeds: [ teams.currentPageResults.map(formatTeam)[0] ] };
    } else {
        return 'No team found.';
    }
}

function formatTeam(team) {
    return new Discord.MessageEmbed()
        .setAuthor({name: team.leader.name, iconURL: 'https://playstrategy.org/assets/logo/playstrategy-favicon-32-invert.png', url: getLink(team.leader.name)})
        .setThumbnail('https://playstrategy.org/assets/logo/playstrategy-favicon-64.png')
        .setTitle(team.name)
        .setURL(`https://playstrategy.org/team/${team.id}`)
        .setDescription(team.description);
}

function getLink(name) {
    return `https://playstrategy.org/@/${name}`;
}

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return team(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
