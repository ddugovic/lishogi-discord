function formatLink(text) {
    const pattern = /^(.+?)(?::\s+|\s+-\s+|\s+)(https?:\/\/\S+)$/;
    if ((match = text.match(pattern)))
        return `[${match[1]}](${match[2]})`;
    return text;
}

function formatSocialLinks(text) {
    const links = [];
    for (user of getDiscord(text))
        links.push(`[Discord](https://${user})`);
    for (user of getGitHub(text))
        links.push(`[GitHub](https://${user})`);
    for (user of getMaiaChess(text))
        links.push(`[Maia Chess](https://${user})`);
    for (user of getTwitch(text))
        links.push(`[Twitch](https://${user})`);
    for (user of getTwitter(text))
        links.push(`[Twitter](https://${user})`);
    for (user of getYouTube(text))
        links.push(`[YouTube](https://${user})`);
    return links;
}

function getDiscord(text) {
    const pattern = /discord.gg\/\w{7,8}/g;
    return text.matchAll(pattern);
}

function getGitHub(text) {
    const pattern = /github.com\/[-\w]{4,39}/g;
    return text.matchAll(pattern);
}

function getMaiaChess(text) {
    const pattern = /maiachess.com/g;
    return text.matchAll(pattern);
}

function getTwitch(text) {
    const pattern = /twitch.tv\/\w{4,25}/g;
    return text.matchAll(pattern);
}

function getTwitter(text) {
    const pattern = /twitter.com\/\w{1,15}/g;
    return text.matchAll(pattern);
}

function getYouTube(text) {
    // https://stackoverflow.com/a/65726047
    const pattern = /youtube\.com\/(?:channel\/UC[\w-]{21}[AQgw]|(?:c\/|user\/)?[\w-]+)/g
    return text.matchAll(pattern);
}

module.exports = { formatLink, formatSocialLinks };
