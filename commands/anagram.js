const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { formatLexicon } = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');

async function anagram(lexicon, alphagrams, interaction) {
    const url = 'https://woogles.io/twirp/word_service.WordService/DefineWords';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { lexicon: lexicon, words: alphagrams.split(/[\s,]+/), definitions: true, anagrams: true };
    return axios.post(url, request, { headers: headers })
        .then(response => formatPages('Alphagram', Object.entries(response.data.results).map(entry => formatEntry(lexicon, ...entry)), interaction, 'Alphagrams not found!'))
        .catch(error => {
            console.log(`Error in anagram(${alphagrams}): \
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
    const [lexicon, alphagrams] = suffix.toUpperCase().split(/[^A-Z0-9?]+/i, 2);
    if (alphagrams.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    else if (lexicon && formatLexicon(lexicon) && alphagrams)
        await anagram(lexicon, alphagrams).then(message => msg.channel.send(message));
    else
        await msg.channel.send(formatLexicon(lexicon) ? 'Words not specified!' : 'Lexicon not found!');
}

async function interact(interaction) {
    const alphagrams = interaction.options.getString('alphagrams');
    if (alphagrams.includes('?'))
        return interaction.editReply('Blank tiles are not supported');
    await interaction.deferReply();
    anagram(interaction.options.getString('lexicon'), alphagrams.toUpperCase(), interaction);
}

module.exports = { process, interact };
