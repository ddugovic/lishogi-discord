const axios = require('axios');
const sfen = import('shogiops/sfen.js');

async function eval(author, fen) {
    if (fen && sfen.parseSfen(fen).isOk) {
        const url = `https://lishogi.org/api/cloud-eval`;
        return axios.get(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' }, params: { fen: fen, multiPv: 3 } })
            .then(response => formatCloudEval(fen, response.data))
            .catch((err) => {
                console.log(`Error in eval(${author.username}): \
                    ${err.response.status} ${err.response.statusText}`);
                return `An error occurred handling your request: \
                    ${err.response.status} ${err.response.statusText}`;
        });
    } else {
        return fen ? 'Invalid SFEN!' : 'Missing SFEN!'
    }
}

function formatCloudEval(fen, data) {
    const formatter = new Intl.NumberFormat("en-GB", { style: "decimal", signDisplay: 'always' });
    var message = `Nodes: ${Math.floor(data['knodes'] / 1000)}M, Depth: ${data['depth']}`;
    const pvs = data['pvs'];
    for (const pv in pvs) {
        message += `\n${formatter.format(pvs[pv]['cp'] / 100)}: ${pvs[pv]['moves']}`;
    }
    message += `\nhttps://lishogi.org/analysis/standard/${fen.replace(/ /g,'_')}`
    return message;
}

function process(bot, msg, sfen) {
    eval(msg.author, sfen).then(url => msg.channel.send(url))
}

async function interact(interaction) {
    await interaction.deferReply();
    await interaction.editReply(await eval(interaction.user, interaction.options.getString('sfen')));
}

module.exports = {process, interact};
