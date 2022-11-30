function chat(user) {
    const url = 'https://woogles.io/twirp/user_service.SocializeService/GetChatsForChannel';
    const headers = { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'Woogles Statbot' };
    const query = { channel: 'chat.lobby' };
    let status, statusText;
    return fetch(url, { method: 'POST', body: JSON.stringify(query), headers: headers })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatChat(json.messages))
        .catch(error => {
            console.log(`Error in chat(${user.username}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
        });
}

function formatChat(messages) {
    return messages.slice(-10).map(formatMessage).join('\n');
}

function formatMessage(message) {
    return `<t:${Math.floor(message.timestamp/1000)}:t> ${message.username}: ${message.message}`;
}

function process(bot, msg) {
    chat(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.reply({ content: await chat(interaction.user), ephemeral: true });
}

module.exports = {process, interact};
