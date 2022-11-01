const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatChallengeRule, formatCategory, formatClock } = require('../lib/format-rules');
const { formatLexicon } = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');
const formatPlayer = require('../lib/format-player');
const timestamp = require('unix-timestamp');
const User = require('../models/User');

function recent(username, interaction) {
    const url = 'https://woogles.io/twirp/game_service.GameMetadataService/GetRecentGames';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { username: username, numGames: 10, offset: 0 };
    return axios.post(url, request, { headers: headers })
        .then(response => Promise.all(response.data.game_info.map(scoreGame).map(formatGame)))
        .then(embeds => formatPages('Game', embeds, interaction, 'No games found!'))
        .catch(error => {
            console.log(`Error in recent(${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function getHistory(playerNicknames, gameId) {
    const url = 'https://woogles.io/twirp/game_service.GameMetadataService/GetGameHistory';
    const headers = { authority: 'woogles.io', origin: 'https://woogles.io' };
    const request = { gameId: gameId };
    return axios.post(url, request, { headers: headers })
        .then(response => formatHistory(playerNicknames, response.data.history));
}

function formatHistory(playerNicknames, history) {
    const plays = [];
    var last;
    for (const event of history.events) {
        if (event.type == 'TILE_PLACEMENT_MOVE')
            plays.push((last = event));
        else if (event.type == 'PHONY_TILES_RETURNED')
            last.invalid = true;
        else
            plays.push(event);
    }
    const first = plays.filter(event => event.player_index == 0).map(formatEvent).join('\n');
    const second = plays.filter(event => event.player_index == 1).map(formatEvent).join('\n');
    return [
        { name: playerNicknames[0], value: first || '*None*', inline: true },
        { name: playerNicknames[1], value: second || '*None*', inline: true }
    ];
}

function formatEvent(event) {
    if (event.type == 'TILE_PLACEMENT_MOVE') {
        const bingo = formatWord(event.words_formed[0], event.played_tiles);
        return `\`${event.position}\` ${bingo}${event.invalid ? '*' : ''} **${event.score}** *${event.cumulative}*`;
    }
    if (['CHALLENGE', 'CHALLENGE_BONUS', 'UNSUCCESSFUL_CHALLENGE_TURN_LOSS'].includes(event.type))
        return `:crossed_swords: **${event.score + event.lost_score}** *${event.cumulative}*`;
    if (event.type == 'EXCHANGE')
        return `\`-\` ${event.exchanged}${formatLeave(event.rack, event.exchanged)}`;
    if (event.type == 'PASS')
        return `\`-\` **${event.rack}**`;
    if (event.type == 'TIME_PENALTY')
        return `:hourglass: **${-event.lost_score}** *${event.cumulative}*`;
    if (event.type == 'END_RACK_PENALTY')
        return `\`-\` ${event.rack} **${-event.end_rack_points}** *${event.cumulative}*`;
    if (event.type == 'END_RACK_PTS')
        return `\`+\` ${event.rack} **${event.end_rack_points}** *${event.cumulative}*`;
}

function formatLeave(rack, tiles) {
    var leave = rack;
    [...tiles].forEach((tile, i) => leave = leave.replace(tile, ''));
    return leave ? ` **${leave}**` : '';
}

function formatWord(word, tiles) {
    // Spells the word using lower-case blank tiles
    return [...tiles].map((tile, i) => tile == '.' ? word[i] : tile).join('');
}

function scoreGame(game) {
    game.players[0].score = game.scores[0];
    game.players[1].score = game.scores[1];
    game.players = game.players.sort((a,b) => b.first - a.first);
    game.scores = game.players.map(player => player.score);
    return game;
}

async function formatGame(game) {
    const playerNames = game.players.map(formatPlayer);
    const playerNicknames = game.players.map(player => player.nickname);
    const blue = Math.min(Math.max(Math.abs(game.scores[0] - game.scores[1]), 0), 255);
    const embed = new EmbedBuilder()
        .setColor(formatColor(255-blue, 0, blue))
        .setTitle(`${playerNames.join(' - ')} (${game.scores.join(' - ')}) #${game.game_id}`)
        .setURL(`https://woogles.io/game/${game.game_id}`)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(`<t:${Math.round(timestamp.fromDate(game.created_at))}>`)
	.setImage(`https://woogles.io/gameimg/${game.game_id}-v2-a.gif`);
    const request = game.game_request;
    if (request)
        return embed.setTitle(`${formatCategory(request.rules.board_layout_name, request.initial_time_seconds, request.increment_seconds, request.max_overtime_minutes)} ${formatClock(request.initial_time_seconds, request.increment_seconds, request.max_overtime_minutes)} ${playerNames.join(' - ')} (${formatChallengeRule(request.challenge_rule)} ${game.scores.join(' - ')}) #${game.game_id}`)
            .setThumbnail(request.player_vs_bot ? 'https://woogles.io/static/media/bio_macondo.301d343adb5a283647e8.jpg' : 'https://woogles.io/logo192.png')
            .addFields(await getHistory(playerNicknames, game.game_id))
            .addFields([{ name: 'Lexicon', value: formatLexicon(request.lexicon) }]);
    return embed;
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
