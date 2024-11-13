const { EmbedBuilder } = require('discord.js');
const formatError = require('../lib/format-error');
const { decodeWord, encodeWord, formatLexicon } = require('../lib/format-lexicon');
const { formatPages } = require('../lib/format-pages');

function paginate(lexicon, status, results) {
  if (status == 200)
    return Object.entries(results).map(entry => formatEntry(lexicon, ...entry));
}

function define(user, lexicon, words, interaction) {
    const url = 'https://woogles.io/api/word_service.WordService/DefineWords';
    const headers = { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'Woogles Statbot' };
    const query = { lexicon: lexicon, words: encodeWord(lexicon, words).split(/[\s,]+/), definitions: true };
    let status, statusText;
    return fetch(url, { method: 'POST', body: JSON.stringify(query), headers: headers })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => json.results ? formatPages('Word', paginate(lexicon, status, filterResults(lexicon, json.results)) ?? [], interaction, 'Word(s) not found!') : formatError(interaction, status, statusText, `${url} ${json.code}: ${json.message}`))
        .catch(error => {
            console.log(`Error in define(${user.username}, ${lexicon}, ${words}): ${error}`);
            return formatError(interaction, status, statusText);
        });
}

function filterResults(lexicon, results) {
    var a = [];
    Object.entries(results).forEach(([key, value]) => {
        if (value.v) {
            a[decodeWord(lexicon, key)] = value;
        }
    });
    return a;
}

function formatEntry(lexicon, word, entry) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: formatLexicon(lexicon), iconURL: flags[lexicon] })
        .setTitle(entry.v ? word : `${word}*`)
        .setThumbnail('https://woogles.io/static/media/bio_macondo.301d343adb5a283647e8.jpg')
        .setDescription(entry.v ? (entry.d || 'Definition not found!') : 'Word not found!');
    return embed;
}

const flags = {
  FRA20: 'https://woogles-flags.s3.us-east-2.amazonaws.com/fr.png',
  RD28: 'https://woogles-flags.s3.us-east-2.amazonaws.com/de.png',
  NSF21: 'https://woogles-flags.s3.us-east-2.amazonaws.com/no.png',
  OSPS49: 'https://woogles-flags.s3.us-east-2.amazonaws.com/pl.png'
}

async function process(bot, msg, suffix) {
    const [lexicon, words] = ((suffix ?? '').trim() + ' ').toUpperCase().split(/\s+/, 2);
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    else if (lexicon && formatLexicon(lexicon) && words)
        await define(msg.author, lexicon, words.trim()).then(message => msg.channel.send(message));
    else
        await msg.channel.send(formatLexicon(lexicon) ? 'Words not specified! (usage: `!define lexicon words`)' : 'Lexicon not found!');
}


async function interact(interaction) {
    const words = interaction.options.getString('words');
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    await interaction.deferReply();
    define(interaction.user, interaction.options.getString('lexicon'), words.toUpperCase(), interaction);
}

module.exports = { process, interact };
