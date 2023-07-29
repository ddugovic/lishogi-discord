const validUrl = require('valid-url');

function checkLink(text) {
    return validUrl.isWebUri(text);
}

function formatLink(text) {
    if (text.match(/\s+/)) {
        if (validUrl.isUri(text)) {
            const words = text.trim().split(/[-:]?\s+/);
            if (checkLink(words[0]))
                return `[${words.slice(1).map(title).join(' ')}](${words[0]})`;
            if (checkLink(words[words.length - 1]))
                return `[${words.slice(0, -1).map(title).join(' ')}](${words[words.length - 1]})`;
        }
    } else if (validUrl.isUri(text)) {
        if (checkLink(text))
            return `[${text}](${text})`;
        return `[${text}](https://${text})`;
    }
    return text;
}

function formatSocialLinks(text) {
    const links = [];
    for (user of getChessMonitor(text))
        links.push(`[ChessMonitor](https://${user})`);
    for (user of getDiscord(text))
        links.push(`[Discord](https://${user})`);
    for (user of getGitHub(text))
        links.push(`[GitHub](https://${user})`);
    for (user of getInstagram(text))
        links.push(`[Instagram](https://${user})`);
    for (user of getMaiaChess(text))
        links.push(`[Maia Chess](https://${user})`);
    for (user of getMastodon(text))
        links.push(`[Mastodon](https://${user})`);
    for (user of getTwitch(text))
        links.push(`[Twitch](https://${user})`);
    for (user of getTwitter(text))
        links.push(`[Twitter](https://${user})`);
    for (user of getYouTube(text))
        links.push(`[YouTube](https://${user})`);
    return links;
}

function getChessMonitor(text) {
    const pattern = /chessmonitor\.com\/u\/\w{20}/g;
    return text.matchAll(pattern);
}

function getDiscord(text) {
    const pattern = /discord\.gg\/\w{7,8}/g;
    return text.matchAll(pattern);
}

function getGitHub(text) {
    const pattern = /github\.com\/[-\w]{4,39}/g;
    return text.matchAll(pattern);
}

function getInstagram(text) {
    const pattern = /instagram\.com\/[\w](?!.*?\.{2})[\w.]{1,28}[\w]/g;
    return text.matchAll(pattern);
}

function getMaiaChess(text) {
    const pattern = /maiachess\.com/g;
    return text.matchAll(pattern);
}

function getMastodon(text) {
    const pattern = /(?:mstdn\.social|fosstodon\.org|gensokyo\.social|ravenation\.club|mastodon\.art|mastodon\.lol|mastodon\.green|mas\.to|mindly\.social|mastodon\.world|masthead\.social|techhub\.social)\/@\w+/g;
    return text.matchAll(pattern);
}

function getTwitch(text) {
    const pattern = /twitch\.tv\/\w{4,25}/g;
    return text.matchAll(pattern);
}

function getTwitter(text) {
    const pattern = /twitter\.com\/\w{1,15}/g;
    return text.matchAll(pattern);
}

function getYouTube(text) {
    // https://stackoverflow.com/a/65726047
    const pattern = /youtube\.com\/(?:channel\/UC[\w-]{21}[AQgw]|(?:@|c\/|user\/)?[\w-]+)/g
    return text.matchAll(pattern);
}

function title(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

module.exports = { checkLink, formatLink, formatSocialLinks };
