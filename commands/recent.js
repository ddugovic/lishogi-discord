const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatChallengeRule, formatCategory, formatClock } = require('../lib/format-rules');
const formatFlag = require('../lib/format-flag');
const { formatLexicon } = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');
const timestamp = require('unix-timestamp');
const User = require('../models/User');

function recent(username, interaction) {
    const url = 'https://woogles.io/twirp/game_service.GameMetadataService/GetRecentGames';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { username: username, numGames: 10, offset: 0 };
    return axios.post(url, request, { headers: headers })
        .then(response => Promise.all(response.data.game_info.map(formatGame)))
        .then(embeds => formatPages('Game', embeds, interaction, 'No games found!'))
        .catch(error => {
            console.log(`Error in recent(${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function getHistory(playerNames, gameId) {
    const url = 'https://woogles.io/twirp/game_service.GameMetadataService/GetGameHistory';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { gameId: gameId };
    return axios.post(url, request, { headers: headers })
        .then(response => formatHistory(playerNames, response.data.history));
}

function formatHistory(playerNames, history) {
    const first = [];
    const second = [];
    for (const [play1, play2] of chunk(history.events, 2)) {
        if (play1 && play1.is_bingo && !play1.lost_score)
            first.push(`${play1.position} ${play1.words_formed[0]} **${play1.score}**`);
        if (play2 && play2.is_bingo && !play2.lost_score)
            second.push(`${play2.position} ${play2.words_formed[0]} **${play2.score}**`);
    }
    return [
        { name: playerNames[0], value: first.length ? first.join('\n') : '*None*', inline: true },
        { name: playerNames[1], value: second.length ? second.join('\n') : '*None*', inline: true }
    ];
}

async function formatGame(game) {
    const playerNames = game.players.sort((a,b) => b.first - a.first).map(formatPlayer);
    const players = playerNames.join(' - ');
    const scores = game.scores.join(' - ');
    const blue = Math.min(Math.max(Math.abs(game.scores[0] - game.scores[1]), 0), 255);
    const embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setTitle(`${players} (${scores})`)
        .setURL(`https://woogles.io/game/${game.game_id}`)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(`<t:${Math.round(timestamp.fromDate(game.created_at))}>`)
	.setImage(`https://woogles.io/gameimg/${game.game_id}-v2-a.gif`);
    const request = game.game_request;
    if (request)
        return embed.setTitle(`${formatCategory(request.rules.board_layout_name, request.initial_time_seconds, request.increment_seconds, request.max_overtime_minutes)} ${formatClock(request.initial_time_seconds, request.increment_seconds, request.max_overtime_minutes)} ${players} (${formatChallengeRule(request.challenge_rule)} ${scores})`)
            .setThumbnail(request.player_vs_bot ? 'https://woogles.io/static/media/bio_macondo.301d343adb5a283647e8.jpg' : 'https://woogles.io/logo192.png')
            .addFields(await getHistory(playerNames, game.game_id))
            .addFields(formatRules(request));
    return embed;
}

function formatRules(request) {
    return [
        { name: 'Lexicon', value: formatLexicon(request.lexicon) }
    ];
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

function chunk(arr, size) {
    return new Array(Math.ceil(arr.length / size))
        .fill('')
        .map((_, i) => arr.slice(i * size, (i + 1) * size));
}

async function process(bot, msg, username) {
    username = username || await getUsername(msg.author);
    if (!username)
        return await msg.channel.send('You need to set your Woogles.io username with setuser!');
    recent(username).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    const username = interaction.options.getString('username') || await getUsername(interaction.user);
    if (!username)
        return await interaction.reply({ content: 'You need to set your Woogles.io username with setuser!', ephemeral: true });
    await interaction.deferReply();
    recent(username, interaction);
}

async function getUsername(author, username) {
    const user = await User.findById(author.id).exec();
    if (user)
        return user.wooglesName;
}

module.exports = { process, interact };
