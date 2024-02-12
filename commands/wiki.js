const { EmbedBuilder } = require('discord.js');
const formatColor = require('../lib/format-color');
const { formatChunks, formatError } = require('../lib/format-pages');
const { formatContent } = require('../lib/parse-feed');

function wiki(author, category, interaction) {
    const url = `http://wiki.shogiharbour.com/api.php?action=query&format=json&prop=pageprops&list=categorymembers&cmtitle=Category:${category}&cmlimit=50`;
    let status, statusText;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => { status = response.status; statusText = response.statusText; return response.json(); })
        .then(json => formatMembers(json))
        .then(embeds => formatChunks(embeds, interaction, 'No pages found!'))
        .catch(error => {
            console.log(`Error in wiki(${author.username}, ${category}): ${error}`);
            return formatError(status, statusText, interaction, `${url} failed to respond`);
        });
}

function formatMembers(members) {
    const pageids = members.query.categorymembers.map(member => member.pageid).join('|');
    const url = `http://wiki.shogiharbour.com/api.php?action=query&format=json&prop=revisions&pageids=${pageids}&formatversion=2&rvprop=content`;
    return fetch(url, { headers: { Accept: 'application/json' } })
        .then(response => response.json())
        .then(json => formatPages(json));
}

function formatPages(pages) {
    const embeds = [];
    for (const page of pages.query.pages)
        embeds.push(formatRevision(page.revisions[0], page.title));
    return embeds;
}

function formatRevision(page, title) {
    var embed = new EmbedBuilder()
        .setTitle(title)
        .setURL(`http://wiki.shogiharbour.com/index.php/${title.replace(' ','_')}`)
        .setDescription(formatContent(page.content, 200));
    const image = getImage(page.content);
    if (image)
        embed = embed.setThumbnail(image);
    return embed;
}

function getImage(content) {
    const match = content.match(/!\[.*?\]\((\S+)\)/)
    if (match)
        return match[1];
}

function process(bot, msg, category) {
    wiki(msg.author, category).then(message => msg.channel.send(message));
}

async function interact(interaction) {
    await interaction.deferReply();
    wiki(interaction.user, interaction.options.getString('category'), interaction);
}

module.exports = {process, interact};
