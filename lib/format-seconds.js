const convertSeconds = require('convert-seconds')
const plural = require('plural')
// Set up UserSchema
function formatSeconds(seconds) {
    var duration = convertSeconds(seconds);
    duration.days = Math.floor(duration.hours / 24);
    duration.hours = duration.hours % 24;
    var message = '';
    if (duration.days)
        message = duration.days + ' ' + plural('day', duration.days);
    if (duration.hours) {
        if (message)
            message += ', ';
        message += duration.hours + ' ' + plural('hour', duration.hours);
    }
    if (!duration.days && duration.minutes) {
        if (message)
            message += ', ';
        message += duration.minutes + ' ' + plural('minute', duration.minutes);
    }
    if (!duration.days && !duration.hours) {
        if (message)
            message += ', ';
        message += duration.seconds + ' ' + plural('second', duration.seconds);
    }
    return message;
}

module.exports = {
    formatSeconds: formatSeconds
}
