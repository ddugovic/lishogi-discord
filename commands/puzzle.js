const ChessWebAPI = require('chess-web-api');

async function puzzle(author) {
    return new ChessWebAPI().getDailyPuzzle()
        .then(response => response.body.url)
        .catch(error => {
            console.log(`Error in puzzle(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function process(bot, msg) {
    puzzle(msg.author).then(message => msg.channel.send(message));
}

async function reply(interaction) {
    return puzzle(interaction.user);
}

module.exports = {process, reply};
