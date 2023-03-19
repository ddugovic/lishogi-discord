function formatTitledUserLink(title, username) {
    const name = title ? `${title} @${username}` : `@${username}`;
    return `[${username}](https://lichess.org/@/${username})`;
}

function formatSiteLink(text) {
    return formatArenaLink(text) ?? formatTeamLink(text) ?? formatUserLink(text) ?? formatURI(text) ?? text;
}

function formatSiteLinks(text) {
    text = formatArenaLinks(text);
    text = formatCoachLinks(text);
    text = formatTeamLinks(text);
    text = formatUserLinks(text);
    text = formatURIs(text);
    return text;
}

function getSiteLinks(text) {
    const links = [];
    for (match of getArenaLinks(text))
        links.push(`[Arena](https://${match[0]})`);
    for (match of getCoachLinks(text))
        links.push(`[Coach](https://${match[0]})`);
    for (match of getTeamLinks(text))
        links.push(`[Team](https://${match[0]})`);
    return links;
}

function formatArenaLink(text) {
    const arena = /(?<!\S)https:\/\/lichess\.org\/tournament\/([-\w]+)\/?$/;
    if ((match = text.match(arena)))
        return text.replace(match[0], `:trophy: [#${match[1]}](${match[0]})`);
}

function formatArenaLinks(text) {
    const arena = /(?<!\S)https:\/\/lichess\.org\/tournament\/([-\w]+)\/?/g;
    for (match of text.matchAll(arena))
        text = text.replace(match[0], `:trophy: [#${match[1]}](${match[0]})`);
    return text;
}

function getArenaLinks(text) {
    const pattern = /(?<!\S)lichess\.org\/tournament\/([-\w]+)/g;
    return text.matchAll(pattern);
}

function formatCoachLink(text) {
    const coach = /(?<!\S)https:\/\/lichess\.org\/coach\/([-\w]+)\/?$/;
    if ((match = text.match(coach)))
        return text.replace(match[0], `[Coach](${match[0]})`);
}

function formatCoachLinks(text) {
    const coach = /(?<!\S)https:\/\/lichess\.org\/coach\/([-\w]+)\/?/g;
    for (match of text.matchAll(coach))
        text = text.replace(match[0], `[Coach](${match[0]})`);
    return text;
}

function getCoachLinks(text) {
    const pattern = /(?<!\S)lichess\.org\/coach\/([-\w]+)/g;
    return text.matchAll(pattern);
}

function formatTeamLink(text) {
    const battle = /^https:\/\/lichess\.org\/team\/([-\w]+)\/tournaments\/?$/;
    if ((match = text.match(battle)))
        return `[${title(match[1])} Battles](${match[0]})`;
    const team = /^https:\/\/lichess\.org\/team\/([-\w]+)\/?$/;
    if ((match = text.match(team)))
        return `[${title(match[1])}](${match[0]})`;
}

function formatTeamLinks(text) {
    const battle = /^https:\/\/lichess\.org\/team\/([-\w]+)\/tournaments\/?/g;
    for (match of text.matchAll(battle))
        text = text.replace(match[0], `[${title(match[1])} Battles](${match[0]})`);
    const team = /^https:\/\/lichess\.org\/team\/([-\w]+)\/?/g;
    for (match of text.matchAll(team))
        text = text.replace(match[0], `[${title(match[1])}](${match[0]})`);
    return text;
}

function getTeamLinks(text) {
    const pattern = /(?<!\S)lichess\.org\/team\/([-\w]+)/g;
    return text.matchAll(pattern);
}

function formatUserLink(text) {
    const username = /(?<!\S)@([-\w]+)/;
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
    const username = /(?<!\S)@([-\w]+)/g;
    for (match of text.matchAll(username))
        text = text.replace(match[0], `[${match[0]}](https://lichess.org/@/${match[1]})`);

    const url = /(?<!\S)https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?/g;
    for (match of text.matchAll(url))
        text = text.replace(match[0], `[@${match[1]}](${match[0]})`);

    const markdown = /(?<!\S)\[([-\w]+)\]\((https:\/\/(?:lichess\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)/g;
    for (match of text.matchAll(markdown))
        text = text.replace(match[0], `[@${match[1]}](${match[2]})`);

    return text;
}

function getUserLinks(text) {
    const pattern = /(?<!\S)@([-\w]+)/g;
    return text.matchAll(pattern);
}

function formatPositionURL(fen, lastMove, theme, piece) {
    fen = fen.replace(/ /g, '+');
    return lastMove ? `https://lichess1.org/export/fen.gif?fen=${fen}&lastMove=${lastMove}&theme=${theme}&piece=${piece}` : `https://lichess1.org/export/fen.gif?fen=${fen}&theme=${theme}&piece=${piece}`;
}

function formatURI(text) {
    const uri = /(?<!\S)[Ll]ichess\.org(?:\/[-\w]+)+\/?$/;
    if ((match = text.match(uri)))
        return `[${match[0]}](https://${match[0]})`;
}

function formatURIs(text) {
    const uri = /(?<!\S)[Ll]ichess\.org(?:\/[-\w]+)+\/?/g;
    for (match of text.matchAll(uri))
        text = text.replace(match[0], `[${match[0]}](https://${match[0]})`);
    return text;
}

function getURIs(text) {
    const pattern = /(?<!\S)[Ll]ichess\.org(?:\/[-\w]+)+/g;
    return text.matchAll(pattern);
}

function title(str) {
    return str.split('-')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

module.exports = { formatTitledUserLink, formatArenaLink, formatArenaLinks, formatPositionURL, formatSiteLink, formatSiteLinks, formatTeamLink, formatTeamLinks, formatUserLink, formatUserLinks, formatURI, formatURIs, getSiteLinks };
