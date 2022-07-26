const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatFlag = require('../lib/format-flag');
const formatLexicon = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');

async function define(lexicon, words, interaction) {
    const url = `https://woogles.io/twirp/word_service.WordService/DefineWords`;
    const request = { lexicon: lexicon, words: words.split(/\W+/), definitions: true };
    const headers = { authority: 'woogles.io', accept: 'application/json', origin: 'https://woogles.io' };
    return axios.post(url, request, { headers: headers })
        .then(response => formatPages('Word', Object.entries(response.data.results).map(entry => formatEntry(lexicon, ...entry)), interaction, 'No words found!'))
        .catch(error => {
            console.log(`Error in define(${words}): \
                ${error} ${error.stack}`);
            console.log(`Error in define(${words}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatEntry(lexicon, word, entry) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: lexicon })
        .setTitle(entry.v ? word : `${word}*`)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(entry.v ? entry.d : 'Definition not found!');
    return embed;
}

function formatPlayer(player) {
    var name = player.nickname;
    if (player.country_code) {
        const flag = formatFlag(player.country_code.toUpperCase());
        if (flag)
            name = `${flag} ${name}`;
    }
    if (player.title)
        name = `${player.title} ${name}`;
    return name;
}

function process(bot, msg, suffix) {
    const [lexicon, words] = suffix.split(/\W+/, 2);
    define(lexicon.toUpperCase(), words.toUpperCase()).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    define(interaction.options.getString('lexicon'), interaction.options.getString('words').toUpperCase(), interaction);
}

module.exports = { process, interact };
