const formatFlag = require('../lib/format-flag');

function formatPlayer(player, username) {
    var name = player.first_name || player.last_name || player.full_name || player.nickname || username;
    if (player.country_code) {
        const flag = formatFlag(player.country_code.toUpperCase());
        if (flag)
            name = `${flag} ${name}`;
    }
    if (player.title)
        name = `${player.title} ${name}`;
    return name;
}

module.exports = formatPlayer;
