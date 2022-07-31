const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatPages = require('../lib/format-pages');

async function define(lexicon, words, interaction) {
    const url = 'https://woogles.io/twirp/word_service.WordService/DefineWords';
    const request = { lexicon: lexicon, words: words.split(/[\s,]+/), definitions: true };
    const headers = { authority: 'woogles.io', accept: 'application/json', origin: 'https://woogles.io' };
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
        .setAuthor({ name: lexica[lexicon], iconURL: flags[lexicon] })
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

const lexica = {
  CSW21: 'Collins Scrabble Words, published under license with Collins, an imprint of HarperCollins Publishers Limited',
  NWL20: 'NASPA Word List, 2020 Edition (NWL20), © 2020 North American Word Game Players Association. All rights reserved.',
  ECWL: 'Common English Lexicon, Copyright (c) 2021 Fj00. Used with permission.',
  FRA20: 'Français (French)',
  RD28: 'The “Scrabble®-Turnierliste” used as the German Lexicon is subject to copyright and related rights of Scrabble® Deutschland e.V. With the friendly assistance of Gero Illings SuperDic.',
  NSF21: 'The NSF word list is provided by the language committee of the Norwegian Scrabble Player Association. Used with permission.',
  NSWL20: 'NASPA School Word List 2020 Edition (NSWL20), © 2020 North American Word Game Players Association. All rights reserved.'
};

async function process(bot, msg, suffix) {
    const [lexicon, words] = suffix.toUpperCase().split(/[^A-Z0-9?]+/i, 2);
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    else if (lexicon && lexica[lexicon] && words)
        await define(lexicon, words).then(message => msg.channel.send(message));
    else
        await msg.channel.send(lexica[lexicon] ? 'Words not specified!' : 'Lexicon not found!');
}

async function interact(interaction) {
    const words = interaction.options.getString('words');
    if (words.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    await interaction.deferReply();
    define(interaction.options.getString('lexicon'), words.toUpperCase(), interaction);
}

module.exports = { process, interact };
