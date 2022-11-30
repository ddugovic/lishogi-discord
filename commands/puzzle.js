async function puzzle(user) {
    const url = 'https://woogles.io/twirp/puzzle_service.PuzzleService/GetStartPuzzleId';
    const headers = { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'Woogles Statbot' };
    const query = { lexicon: 'NWL20' };
    let status, statusText;
    return fetch(url, { method: 'POST', body: JSON.stringify(query), headers: headers })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatPuzzle(json))
        .catch(error => {
            console.log(`Error in puzzle(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatPuzzle(json) {
    return `https://woogles.io/puzzle/${json.puzzle_id}`;
}

function process(bot, msg) {
    puzzle(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    interaction.editReply(await puzzle(interaction.user));
}

module.exports = {process, interact};
