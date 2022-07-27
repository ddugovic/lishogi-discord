const axios = require('axios');

function chat() {
    const url = 'https://woogles.io/twirp/user_service.SocializeService/GetChatsForChannel';
    const context = {
        'authority': 'woogles.io',
        'accept': 'application/json',
        'origin': 'https://woogles.io'
    };
    return axios.post(url, { channel: 'chat.lobby' }, { headers: context })
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
    return await interaction.reply({ content: await chat(), ephemeral: true });
}

module.exports = { interact };
