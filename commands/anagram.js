const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatFlag = require('../lib/format-flag');
const formatLexicon = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');

async function anagram(lexicon, alphagrams, interaction) {
    const url = `https://woogles.io/twirp/word_service.WordService/DefineWords`;
    const request = { lexicon: lexicon, words: alphagrams.split(/[\s,]+/), definitions: true, anagrams: true };
    const headers = { authority: 'woogles.io', accept: 'application/json', origin: 'https://woogles.io' };
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
        .setAuthor({ name: lexica[lexicon] })
        .setTitle(entry.v ? word : `${word}*`)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(entry.v ? entry.d : 'Definition not found!');
    return embed;
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
    const [lexicon, alphagrams] = suffix.toUpperCase().split(/[^A-Z0-9?]+/i, 2);
    if (alphagrams.includes('?'))
        await msg.channel.send('Blank tiles are not supported');
    else if (lexicon && lexica[lexicon] && alphagrams)
        await anagram(lexicon, alphagrams).then(message => msg.channel.send(message));
    else
        await msg.channel.send(lexica[lexicon] ? 'Words not specified!' : 'Lexicon not found!');
}

async function interact(interaction) {
    const alphagrams = interaction.options.getString('alphagrams');
    if (alphagrams.includes('?'))
        return interaction.editReply('Blank tiles are not supported');
    await interaction.deferReply();
    anagram(interaction.options.getString('lexicon'), alphagrams.toUpperCase(), interaction);
}

module.exports = { process, interact };
