const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const formatClock = require('../lib/format-clock');
const formatFlag = require('../lib/format-flag');
const formatLexicon = require('../lib/format-lexicon');
const formatPages = require('../lib/format-pages');
const timestamp = require('unix-timestamp');
const User = require('../models/User');

async function recent(username, interaction) {
    const url = `https://woogles.io/twirp/game_service.GameMetadataService/GetRecentGames`;
    const request = { username: username, numGames: 10, offset: 0 };
    const headers = { authority: 'woogles.io', accept: 'application/json', origin: 'https://woogles.io' };
    return axios.post(url, request, { headers: headers })
        .then(response => formatPages('Game', response.data.game_info.map(formatGame), interaction, 'No games found!'))
        .catch(error => {
            console.log(`Error in recent(${username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatGame(game) {
    const players = game.players.map(formatPlayer).join(' - ');
    var embed = new EmbedBuilder()
        .setTitle(players)
        .setURL(`https://woogles.io/game/${game.game_id}`)
        .setThumbnail('https://woogles.io/logo192.png')
        .setDescription(`<t:${Math.round(timestamp.fromDate(game.created_at))}>`)
	.setImage(`https://woogles.io/gameimg/${game.game_id}-v2-a.gif`);
    const rules = game.game_request;
    if (rules)
        embed = embed
            .setTitle(`${formatClock(rules.initial_time_seconds, rules.increment_seconds, rules.max_overtime_minutes)} ${players}`)
            .addFields([
                { name: 'Lexicon', value: formatLexicon(rules.lexicon), inline: true },
                { name: 'Rule', value: rules.challenge_rule, inline: true }
            ]);
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
