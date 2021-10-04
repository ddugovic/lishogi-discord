// View privacy policy
function privacy(bot, msg) {
    msg.channel.send('This bot only stores your Lichess username and favorite game mode. Contact Toadofsky on Tadpole Pond if you need your data removed and cannot figure out how to use the deleteuser command.')
}

module.exports = privacy;
