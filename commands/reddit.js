const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const formatPages = require('../lib/format-pages');
const fn = require('friendly-numbers');
const RedditImageFetcher = require('reddit-image-fetcher');

function reddit(author, interaction) {
    return RedditImageFetcher.fetch({
        searchLimit: 100,
        total: 10,
        type: 'custom',
        subreddit: ['omgwords', 'Woogles'],
        allowNSFW: false
    })
        .then(response => response.map(formatPost))
        .then(embeds => formatPages('Image', embeds, interaction, 'No safe for work images found!'))
        .catch(error => {
            console.log(`Error in reddit(${author.username}): \
                ${error.response.status} ${error.response.statusText}`);
            return `An error occurred handling your request: \
                ${error.response.status} ${error.response.statusText}`;
        });
}

function formatPost(post) {
    const red = Math.min(Math.floor(post.upvotes / 5), 255);
    return new EmbedBuilder()
        .setColor(formatColor(red, 0, 255-red))
        .setTitle(post.title.substr(0, 256))
        .setURL(post.postLink)
        .addFields([
            { name: 'Upvotes', value: `**${fn.format(post.upvotes)}**`, inline: true },
            { name: 'Ratio', value: `${post.upvoteRatio}`, inline: true }
        ])
        .setImage(post.image);
}

function process(bot, msg) {
    reddit(msg.author).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    return reddit(interaction.user, interaction);
}

module.exports = {process, interact};
