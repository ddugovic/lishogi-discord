const axios = require('axios');

async function puzzle() {
    // Getting a puzzle ID fails for some reason, so return instead.
    return 'https://woogles.io/puzzle';
    const url = 'https://woogles.io/twirp/puzzle_service.PuzzleService/GetStartPuzzleId';
    const context = {
        'authority': 'woogles.io',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, 'NWL20', {headers: context})
        .then(response => formatPuzzle(response.data))
        .catch((err) => {
            console.log(`Error in puzzle(): \
                ${err.response.status} ${err.response.statusText}`);
            return `An error occurred handling your request: \
                ${err.response.status} ${err.response.statusText}`;
        });
}

function formatPuzzle(data) {
    return `https://woogles.io/puzzle/${data}`;
}

function process(bot, msg) {
    puzzle().then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    interaction.editReply(await puzzle());
}

module.exports = {process, interact};
