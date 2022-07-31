const axios = require('axios');

function chat() {
    const url = 'https://woogles.io/twirp/user_service.SocializeService/GetChatsForChannel';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { channel: 'chat.lobby' };
    return axios.post(url, request, { headers: headers })
        .then(response => formatChat(response.data.messages))
        .catch(error => {
            console.log(`Error in chat(): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatChat(messages) {
    return messages.slice(-10).map(formatMessage).join('\n');
}

function formatMessage(message) {
    return `<t:${Math.floor(message.timestamp/1000)}:t> ${message.username}: ${message.message}`;
}

async function interact(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.reply({ content: await chat(), ephemeral: true });
}

module.exports = { interact };
