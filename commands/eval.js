const axios = require('axios');
const validateFEN = require('fen-validator').default;

async function eval(author, fen) {
    if (validateFEN(fen)) {
        const url = `https://lishogi.org/api/cloud-eval?fen=${fen}`;
        return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
            .then(response => formatCloudEval(response.data))
            .catch((err) => {
                console.log(`Error in eval(${author.username}): \
                    ${err.response.status} ${err.response.statusText}`);
                return `An error occurred handling your request: \
                    ${err.response.status} ${err.response.statusText}`;
        });
    } else {
        return fen ? 'Invalid FEN!' : 'Missing FEN!'
    }
}

function formatCloudEval(data) {
    const formatter = new Intl.NumberFormat("en-GB", { style: "decimal", signDisplay: 'always' });
    const pv = data['pvs'][0]
    return `${formatter.format(pv['cp'] / 100)}: ${pv['moves']}`;
}

function process(bot, msg, fen) {
    eval(msg.author, fen).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return eval(interaction.user, interaction.options.getString('fen'));
}

module.exports = {process, reply};
