const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { checkLink } = require('../lib/format-links');
const { formatPages } = require('../lib/format-pages');
const fn = require('friendly-numbers');
const { decodeText, fetchRedditPosts, formatAuthorName, formatDescription, formatURL } = require('../lib/search-reddit');

function mahjong(author, interaction) {
    return fetchRedditPosts('mahjong')
        .then(response => Object.values(response).map(post => formatPost(post.data)))
        .then(embeds => formatPages('Post', embeds, interaction, 'No posts found!'))
        .catch(error => {
            console.log(`Error in mahjong(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatPost(post) {
    const red = Math.min(Math.floor(post.ups / 5), 255);
    var embed = new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setAuthor({name: formatAuthorName(post), iconURL: 'https://b.thumbs.redditmedia.com/OS99xM7YSQ_za8Iy.png', url: `https://reddit.com/u/${post.author}`})
        .setTitle(decodeText(post.title).substr(0, 100))
        .setURL(`https://reddit.com${post.permalink}`)
        .addFields([
            { name: 'Comments', value: `**${fn.format(post.num_comments)}**`, inline: true },
            { name: 'Upvotes', value: `**${fn.format(post.ups)}**`, inline: true },
            { name: 'Ratio', value: `${post.upvote_ratio}`, inline: true }
        ]);
    var image = null;
    if (post.domain == 'i.imgur.com' || post.domain == 'i.redd.it')
        embed = embed.setImage((image = post.url_overridden_by_dest ?? post.url));
    else if (post.media && post.media.oembed && post.media.oembed.thumbnail_url)
        embed = embed.setImage(post.media.oembed.thumbnail_url);
    else if (post.thumbnail && checkLink(post.thumbnail))
        embed = embed.setThumbnail(post.thumbnail);
    else if (post.gallery_data)
        embed = embed.setDescription((image = post.gallery_data.items.map(item => `- ${item.caption}` || '- <no caption>').join('\n')));
    if (post.selftext || !(image || (post.thumbnail && post.domain == 'v.redd.it')))
        embed = embed.setDescription(formatDescription(post.selftext, post.url_overridden_by_dest, post.url));
    return embed;
}

function process(bot, msg) {
    mahjong(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    mahjong(interaction.user, interaction);
}

module.exports = {process, interact};