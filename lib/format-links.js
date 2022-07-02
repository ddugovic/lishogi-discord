function formatLinks(text) {
    const links = [];
    for (user of getDiscord(text))
        links.push(`[Discord](https://${user})`);
    for (user of getGitHub(text))
        links.push(`[GitHub](https://${user})`);
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

function formatUserLink(text) {
    const username = /@([-\w]+)/;
    if ((match = text.match(username)))
        return `[${match[0]}](https://lidraughts.org/@/${match[1]})`;

    const url = /https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?/;
    if ((match = text.match(url)))
        return `[@${match[1]}](${match[0]})`;

    const markdown = /\[([-\w]+)\]\((https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)/;
    if ((match = text.match(markdown)))
        return `[@${match[1]}](${match[2]})`;

    return text;
}

function formatUserLinks(text) {
    text = formatUserLink(text);
    const markdown = /\[([-\w]+)\]\((https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)/g;
    if ((match = text.match(markdown)))
        text = text.replace(match, `[@${match[1]}](${match[2]})`);

    return text;
}

module.exports = { formatLinks, formatUserLink, formatUserLinks };
