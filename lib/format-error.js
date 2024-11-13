function formatError(status, statusText, message) {
    if (message)
        return `An error occurred handling your request: ${status ?? '444'} ${statusText ?? 'No Response'} ${message}`;
    else
        return `An error occurred handling your request: ${status ?? '444'} ${statusText ?? 'No Response'}`;
}

module.exports = formatError;
