const { EmbedBuilder } = require('discord.js');
const { decode } = require('html-entities');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const fn = require('friendly-numbers');
const redditFetch = require('reddit-fetch');

function reddit(author, interaction) {
    return redditFetch({
        subreddit: 'shogi',
        sort: 'hot',
        allowNSFW: false,
        allowModPost: true,
        allowCrossPost: true,
        allowVideo: false
    })
        .then(response => Object.values(response).map(post => formatPost(post.data)))
        .then(embeds => formatPages(embeds, interaction, 'No posts found!'))
        .catch(error => {
            console.log(`Error in reddit(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatPost(post) {
    const red = Math.min(Math.floor(post.ups / 5), 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: formatAuthorName(post), iconURL: 'https://styles.redditmedia.com/t5_2rkeb/styles/communityIcon_u4nhn2sg02141.png?width=256&s=aa67bca23c4a5c3610e4cf3cf0e5e698849d219f', url: `https://reddit.com/u/${post.author}`})
        .setTitle(decode(post.title).substr(0, 256))
        .setURL(`https://reddit.com${post.permalink}`)
        .addFields([
            { name: 'Comments', value: `**${fn.format(post.num_comments)}**`, inline: true },
            { name: 'Upvotes', value: `**${fn.format(post.ups)}**`, inline: true },
            { name: 'Ratio', value: `${post.upvote_ratio}`, inline: true }
        ]);
    if (post.selftext ?? post.url)
        embed = embed.setDescription(formatDescription(post))
    if (post.domain == 'i.redd.it')
        embed = embed.setImage(post.url);
    else if (post.media && post.media.oembed && post.media.oembed.thumbnail_url)
        embed = embed.setImage(post.media.oembed.thumbnail_url);
    return embed;
}

function formatDescription(post) {
    const description = (decode(post.selftext) ?? post.url).replace(/\n+(?:&#x200B;|\**)\n+/g, '\n\n').replace(/(?<=https?:\/\/)www\./g, '');
    return description.substr(0, 4096);
}

function formatAuthorName(post) {
    const name = post.link_flair_type == 'text' && post.author_flair_text ? `${post.author} (${post.author_flair_text})` : post.author;
    var medals = '';
    for (var i = 0; i < post.gilded; i++)
        medals += ' :medal:';
    return `${name}${medals}`
}

function process(bot, msg) {
    reddit(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    reddit(interaction.user, interaction);
}

module.exports = {process, interact};
