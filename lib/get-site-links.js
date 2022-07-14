function getUserLink(text) {
    const username = /(?<!\S)@([-\w]+)/;
    if ((match = text.match(username)))
        return `https://lichess.org/@/${match[1]}`;

    const url = /^https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?$/;
    if ((match = text.match(url)))
        return `${match[0]}`;

    const markdown = /^\[([-\w]+)\]\((https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)$/;
    if ((match = text.match(markdown)))
        return `${match[2]}`;

    return text;
}

module.exports = getUserLink;
