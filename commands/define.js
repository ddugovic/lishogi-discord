const { EmbedBuilder } = require('discord.js');
const { formatLexicon } = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');

async function define(user, lexicon, words, interaction) {
    const url = 'https://woogles.io/twirp/word_service.WordService/DefineWords';
    const headers = { accept: 'application/json', authority: 'woogles.io', 'content-type': 'application/json', origin: 'https://woogles.io' };
    const body = { lexicon: lexicon, words: words.split(/[\s,]+/), definitions: true };
    let status, statusText;
    return fetch(url, { method: 'POST', body: JSON.stringify(body), headers: headers })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatPages('Alphagram', Object.entries(json.results).map(entry => formatEntry(lexicon, ...entry)), interaction, 'Alphagrams not found!'))
        .catch(error => {
            console.log(`Error in define(${user.username}, ${lexicon}, ${words}): ${error}`);
            return `An error occurred handling your request: ${status} ${statusText}`;
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
        await define(msg.author, lexicon, words).then(message => msg.channel.send(message));
    else
        await msg.channel.send(formatLexicon(lexicon) ? 'Words not specified!' : 'Lexicon not found!');
}


async function interact(interaction) {
    const words = interaction.options.getString('words');
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    await interaction.deferReply();
    define(interaction.user, interaction.options.getString('lexicon'), words.toUpperCase(), interaction);
}

module.exports = { process, interact };
