const { formatSocialLinks } = require('./format-links');
const formatTable = require('./format-table');
const redditFetch = require('reddit-fetch');

function fetchRedditPosts(subreddit) {
    return redditFetch({
        subreddit: subreddit,
        sort: 'hot',
        allowNSFW: false,
        allowModPost: true,
        allowCrossPost: true,
        allowVideo: false
    });
}

function formatAuthorName(post) {
    const name = post.link_flair_type == 'text' && post.author_flair_text ? `${post.author} (${post.author_flair_text})` : post.author;
    var medals = '';
    if (post.gildings) {
        for (var i = 0; i < (post.gildings.gid_1 ?? 0); i++)
            medals += post.gilded ? ' 🥇' : ' 🥈';
        for (var i = 0; i < (post.gildings.gid_2 ?? 0); i++)
            medals += ' 🥈';
    }
    return `${name}${medals}`
}

function formatDescription(selftext, url_overridden_by_dest, url) {
    // Formats simple tables
    var text = selftext ? decodeText(selftext).replace(/\n+(?:&#x200B;|\**)\n+/g, '\n\n') : formatURL(url_overridden_by_dest ?? url);
    text = text.replace(/(?<=https?:\/\/)www\./g, '');
    //const pattern = /(?<=^|\n)((?:\[?\*\*[^\*\|]+\*\*(?:\]\(https?:\/\/[-\w\.\/]+\))?(?: \| )?)+)\r?\n(?::-+:?\|?)+((?:\r?\n(?:[^\|\n]+[$\|]?)+)+)/;
    const pattern = /(?<=^|\n)((?:[^\|\n]+(?:$| \| ))+)\r?\n(?::?-+(?: \| |:\|:)?)+((?:\r?\n(?:[^\|\n]+[$\|]?)+)+)/m;
    let match;
    while ((match = text.match(pattern)))
        text = text.replace(match[0], formatTable(match[1].trim().replace(/\*\*/g, ''), match[2].trim()))
    return text.substr(0, 4096);
}

function decodeText(text) {
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function formatGalleryItem(item) {
    const description = item.caption ?? `${item.media_id}.jpg`;
    return `[${description}](https://i.redd.it/${item.media_id}.jpg)`;
}

function formatURL(url) {
    const links = formatSocialLinks(url);
    return links.length ? links[0] : url;
}

module.exports = { decodeText, fetchRedditPosts, formatAuthorName, formatDescription, formatGalleryItem, formatURL };
