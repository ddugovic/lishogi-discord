const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatError = require('../lib/format-error');
const { formatChunks } = require('../lib/format-pages');

async function eval(sfen, interaction) {
    const { parseSfen } = await import('shogiops/sfen.js');
    if (sfen && parseSfen('standard', sfen).isOk) {
        const url = `https://lishogi.org/api/cloud-eval?sfen=${sfen}&multiPv=3`;
        let status, statusText;
        return fetch(url, { headers: { Accept: 'application/vnd.lishogi.v3+json' }, params: { fen: sfen, multiPv: 3 } })
            .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
            .then(json => formatCloudEval(sfen, json))
            .then(embed => formatChunks([embed], interaction, 'No cloud evaluation found!'))
            .catch((error) => {
                console.log(`Error in eval(${sfen}): ${error}`);
                return formatError(status, statusText, `${url} failed to respond`);
        });
    } else {
        return sfen ? 'Invalid SFEN!' : 'Missing SFEN!'
    }
}

function formatCloudEval(fen, data) {
    const red = Math.min(Math.max(Math.floor(data['knodes'] / 1000), 0), 255);
    const formatter = new Intl.NumberFormat("en-GB", { style: "decimal", signDisplay: 'always' });
    var message = `Nodes: ${Math.floor(data['knodes'] / 1000)}M, Depth: ${data['depth']}`;
    const pvs = data['pvs'];
    for (const pv in pvs) {
        message += `\n${formatter.format(pvs[pv]['cp'] / 100)}: ${pvs[pv]['moves']}`;
    }

    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setThumbnail('https://lishogi1.org/assets/logo/lishogi-favicon-64.png')
        .setTitle(data.sfen)
        .setURL(`https://lishogi.org/analysis/standard/${fen.replace(/ /g,'_')}`)
        .setDescription(message);
}

function process(bot, msg, sfen) {
    eval(sfen).then(message => msg.channel.send(message));
}

function interact(interaction) {
    return eval(interaction.options.getString('sfen'), interaction);
}

module.exports = {process, interact};
