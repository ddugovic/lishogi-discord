// Send daily puzzle info
function puzzle(bot, msg) {
    msg.channel.send('https://lichess.org/training/daily')
}

module.exports = puzzle;
