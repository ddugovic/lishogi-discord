const { EmbedBuilder } = require('discord.js');
const decode = require('decode-html');
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
        .then(response => [response].map(formatPost))
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
        .setAuthor({name: formatAuthorName(post), url: `https://reddit.com/u/${post.author}`})
        .setTitle(decode(post.title).substr(0, 256))
        .setURL(`https://reddit.com${post.permalink}`)
        .addFields([
            { name: 'Comments', value: `**${fn.format(post.num_comments)}**`, inline: true },
            { name: 'Upvotes', value: `**${fn.format(post.ups)}**`, inline: true },
            { name: 'Ratio', value: `${post.upvote_ratio}`, inline: true }
        ]);
    if (post.selftext)
        embed = embed.setDescription(decode(post.selftext))
    if (post.domain == 'i.redd.it')
        embed = embed.setImage(post.url);
    else if (post.domain == 'youtube.com')
        embed = embed.setImage(post.media.oembed.thumbnail_url);
    return embed;
}

function formatAuthorName(post) {
    return post.author_flair_text ? `u/${post.author} (${post.author_flair_text})` : `u/${post.author}`;
}

function process(bot, msg) {
    reddit(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    reddit(interaction.user, interaction);
}

module.exports = {process, interact};
