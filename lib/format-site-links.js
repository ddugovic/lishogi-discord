function formatTitledUserLink(title, username) {
    const name = title ? `${title} @${username}` : `@${username}`;
    return `[${username}](https://lichess.org/@/${username})`;
}

function formatUserLink(text) {
    const username = /^@([-\w]+)$/;
    if ((match = text.match(username)))
        return `[${match[0]}](https://lichess.org/@/${match[1]})`;

    const url = /^https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?$/;
    if ((match = text.match(url)))
        return `[@${match[1]}](${match[0]})`;

    const markdown = /^\[([-\w]+)\]\((https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)$/;
    if ((match = text.match(markdown)))
        return `[@${match[1]}](${match[2]})`;

    return text;
}

function formatUserLinks(text) {
    const username = /^@([-\w]+)/g;
    for (match of text.matchAll(username))
        text = text.replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);

    const url = /^https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?/g;
    for (match of text.matchAll(url))
        text = text.replace(match[0], `[@${match[1]}](${match[0]})`);

    const markdown = /^\[([-\w]+)\]\((https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)/g;
    for (match of text.matchAll(markdown))
        text = text.replace(match[0], `[@${match[1]}](${match[2]})`);

    return text;
}

module.exports = { formatTitledUserLink, formatUserLinks };
