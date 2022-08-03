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
    const first = history.events.filter(event => filterEvent(event, playerNames[0])).map(formatEvent).join('\n');
    const second = history.events.filter(event => filterEvent(event, playerNames[1])).map(formatEvent).join('\n');
    return [
        { name: playerNames[0], value: first || '*None*', inline: true },
        { name: playerNames[1], value: second || '*None*', inline: true }
    ];
}

function filterEvent(event, nickname) {
    return event.nickname == nickname && event.is_bingo;
}

function formatEvent(event) {
    return `${event.position} ${event.words_formed[0]}${event.lost_score ? '*' : ''} **${event.score}**`;
}

async function formatGame(game) {
    game.players[0].score = game.scores[0];
    game.players[1].score = game.scores[1];
    game.players = game.players.sort((a,b) => b.first - a.first);
    game.scores = game.players.map(player => player.score);

    const playerNames = game.players.sort((a,b) => b.first - a.first).map(formatPlayer);
    const blue = Math.min(Math.max(Math.abs(game.scores[0] - game.scores[1]), 0), 255);
    const embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setTitle(`${playerNames.join(' - ')} (${game.scores.join(' - ')})`)
        .setURL(`https://woogles.io/game/${game.game_id}`)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(`<t:${Math.round(timestamp.fromDate(game.created_at))}>`)
	.setImage(`https://woogles.io/gameimg/${game.game_id}-v2-a.gif`);
    const request = game.game_request;
    if (request)
        return embed.setTitle(`${formatCategory(request.rules.board_layout_name, request.initial_time_seconds, request.increment_seconds, request.max_overtime_minutes)} ${formatClock(request.initial_time_seconds, request.increment_seconds, request.max_overtime_minutes)} ${playerNames.join(' - ')} (${formatChallengeRule(request.challenge_rule)} ${game.scores.join(' - ')})`)
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
