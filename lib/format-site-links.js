function formatTitledUserLink(title, username) {
    const name = title ? `${title} @${username}` : `@${username}`;
    return `[${username}](https://lishogi.org/@/${username})`;
}

function formatSiteLink(text) {
    return formatTeamLink(text) ?? formatUserLink(text);
}

function formatSiteLinks(text) {
    return formatTeamLinks(formatUserLinks(text));
}

function formatTeamLink(text) {
    const battle = /^https:\/\/lishogi.org\/team\/([-\w]+)\/tournaments\/?$/;
    if ((match = text.match(battle)))
        return `[${title(match[1])} Battles](${match[0]})`;
    const team = /^https:\/\/lishogi.org\/team\/([-\w]+)\/?$/;
    if ((match = text.match(team)))
        return `[${title(match[1])}](${match[0]})`;
}

function formatTeamLinks(text) {
    const battle = /^https:\/\/lishogi.org\/team\/([-\w]+)\/tournaments\/?/g;
    for (match of text.matchAll(battle))
        text = text.replace(match[0], `[${title(match[1])} Battles](${match[0]})`);
    const team = /^https:\/\/lishogi.org\/team\/([-\w]+)\/?/g;
    for (match of text.matchAll(team))
        text = text.replace(match[0], `[${title(match[1])}](${match[0]})`);
    return text;
}

function formatUserLink(text) {
    const username = /^@([-\w]+)$/;
    if ((match = text.match(username)))
        return `[${match[0]}](https://lishogi.org/@/${match[1]})`;

    const url = /^https:\/\/(?:lishogi\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?$/;
    if ((match = text.match(url)))
        return `[@${match[1]}](${match[0]})`;

    const markdown = /^\[([-\w]+)\]\((https:\/\/(?:lishogi\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)$/;
    if ((match = text.match(markdown)))
        return `[@${match[1]}](${match[2]})`;

    return text;
}

function formatUserLinks(text) {
    const username = /^@([-\w]+)/g;
    for (match of text.matchAll(username))
        text = text.replace(match[0], `[${match[0]}](https://lishogi.org/@/${match[1]})`);

    const url = /^https:\/\/(?:lishogi\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/([-\w]+)\/?/g;
    for (match of text.matchAll(url))
        text = text.replace(match[0], `[@${match[1]}](${match[0]})`);

    const markdown = /^\[([-\w]+)\]\((https:\/\/(?:lishogi\.org|lidraughts\.org|lishogi\.org|playstrategy\.org)\/@\/\1\/?)\)/g;
    for (match of text.matchAll(markdown))
        text = text.replace(match[0], `[@${match[1]}](${match[2]})`);

    return text;
}

function title(str) {
    return str.split('-')
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(' ');
}

module.exports = { formatTitledUserLink, formatSiteLink, formatSiteLinks, formatTeamLink, formatTeamLinks, formatUserLink, formatUserLinks };
