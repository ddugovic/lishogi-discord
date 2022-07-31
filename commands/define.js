const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { formatLexicon } = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');

async function define(lexicon, words, interaction) {
    const url = 'https://woogles.io/twirp/word_service.WordService/DefineWords';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { lexicon: lexicon, words: words.split(/[\s,]+/), definitions: true };
    return axios.post(url, request, { headers: headers })
        .then(response => formatPages('Word', Object.entries(response.data.results).map(entry => formatEntry(lexicon, ...entry)), interaction, 'Words not found!'))
        .catch(error => {
            console.log(`Error in define(${words}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatEntry(lexicon, word, entry) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: formatLexicon(lexicon), iconURL: flags[lexicon] })
        .setTitle(entry.v ? word : `${word}*`)
        .setThumbnail('https://woogles.io/static/media/bio_macondo.301d343adb5a283647e8.jpg')
        .setDescription(entry.v ? entry.d : 'Definition not found!');
    return embed;
}

const flags = {
  FRA20: 'https://woogles-flags.s3.us-east-2.amazonaws.com/fr.png',
  RD28: 'https://woogles-flags.s3.us-east-2.amazonaws.com/de.png',
  NSF21: 'https://woogles-flags.s3.us-east-2.amazonaws.com/no.png'
}

async function process(bot, msg, suffix) {
    const [lexicon, words] = suffix.toUpperCase().split(/[^A-Z0-9?]+/i, 2);
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    else if (lexicon && formatLexicon(lexicon) && words)
        await define(lexicon, words).then(message => msg.channel.send(message));
    else
        await msg.channel.send(formatLexicon(lexicon) ? 'Words not specified!' : 'Lexicon not found!');
}


async function interact(interaction) {
    const words = interaction.options.getString('words');
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    await interaction.deferReply();
    define(interaction.options.getString('lexicon'), words.toUpperCase(), interaction);
}

module.exports = { process, interact };
