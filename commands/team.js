const axios = require('axios');

async function team(author, text) {
    if (!text)
        return 'You need to specify text to search by!';
    const url = `https://lidraughts.org/api/team/search?text=${text}&nb=1`;
    return axios.get(url, { headers: { Accept: 'application/json' } })
        .then(response => formatTeams(response.data))
        .catch(error => {
            console.log(`Error in team(${author.text}, ${text}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatTeams(data) {
    return data.nbResults ? `https://lidraughts.org/team/${data.currentPageResults[0].id}` : 'No team found.';
}

function process(bot, msg, text) {
    team(msg.author, text).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return team(interaction.user, interaction.options.getString('text'));
}

module.exports = {process, reply};
