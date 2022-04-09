const axios = require('axios');
const validateSFEN = require('sfen-validator').default;

async function eval(author, sfen) {
    if (validateSFEN(sfen)) {
        const url = `https://lishogi.org/api/cloud-eval?fen=${sfen}&multiPv=3`;
        return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' } })
            .then(response => formatCloudEval(response.data))
            .catch((err) => {
                console.log(`Error in eval(${author.username}): \
                    ${err.response.status} ${err.response.statusText}`);
                return `An error occurred handling your request: \
                    ${err.response.status} ${err.response.statusText}`;
        });
    } else {
        return sfen ? 'Invalid SFEN!' : 'Missing SFEN!'
    }
}

function formatCloudEval(data) {
    const formatter = new Intl.NumberFormat("en-GB", { style: "decimal", signDisplay: 'always' });
    var message = `Nodes: ${Math.floor(data['knodes'] / 1000)}M, Depth: ${data['depth']}`;
    const pvs = data['pvs'];
    for (const pv in pvs) {
        message += `\n${formatter.format(pvs[pv]['cp'] / 100)}: ${pvs[pv]['moves']}`;
    }
    return message;
}

function process(bot, msg, sfen) {
    eval(msg.author, sfen).then(url => msg.channel.send(url))
}

async function reply(interaction) {
    return eval(interaction.user, interaction.options.getString('sfen'));
}

module.exports = {process, reply};
