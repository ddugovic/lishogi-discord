function formatError(interaction, status, statusText, message) {
    if (message)
        message = `An error occurred handling your request: ${status ?? '444'} ${statusText ?? 'No Response'} ${message}`;
    else
        message = `An error occurred handling your request: ${status ?? '444'} ${statusText ?? 'No Response'}`;
    return interaction ? interaction.editReply(message) : message;
}

module.exports = formatError;
