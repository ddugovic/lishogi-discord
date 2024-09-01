function formatError(status, statusText, message) {
    if (status)
        return `An error occurred handling your request: ${status} ${statusText}`;
    else
        return `An error occurred handling your request: ${message}`;
}

module.exports = formatError;
