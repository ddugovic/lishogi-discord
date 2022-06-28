const convertSeconds = require('convert-seconds')
const plural = require('plural')
// Set up UserSchema
function formatSeconds(seconds) {
    var duration = convertSeconds(seconds);
    duration.years = Math.floor(duration.hours / 24 / 365);
    duration.days = Math.floor(duration.hours / 24) % 365;
    duration.hours = duration.hours % 24;
    var message = '';
    if (duration.years) {
        message = `**${duration.years}** ${plural('year', duration.years)}`;
    }
    if (duration.days) {
        if (message)
            message += ', ';
        message += `**${duration.days}** ${plural('day', duration.days)}`;
    }
    if (!duration.years && duration.hours) {
        if (message)
            message += ', ';
        message += `**${duration.hours}** ${plural('hour', duration.hours)}`;
    }
    if (!duration.years && !duration.days && duration.minutes) {
        if (message)
            message += ', ';
        message += `**${duration.minutes}** ${plural('minute', duration.minutes)}`;
    }
    if (!duration.years && !duration.days && !duration.hours && (!duration.minutes || duration.seconds)) {
        if (message)
            message += ', ';
        message += `**${duration.seconds}** ${plural('second', duration.seconds)}`;
    }
    return message;
}

module.exports = formatSeconds
