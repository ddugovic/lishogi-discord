# lishogi discord bot
[![Discord Bots](https://discordbots.org/api/widget/status/842330057841049600.svg)](https://discordbots.org/bot/842330057841049600)
[![Build Status](https://github.com/ddugovic/lishogi-discord/workflows/Node.js%20CI/badge.svg)](https://github.com/ddugovic/lishogi-discord/actions?query=workflow%3A%22Node.js+CI%22)

# Setup

1. Edit `config.example.json` and rename it to `config.json`

2. Run `index.js`

# Features

1. Link your lishogi username with this bot to get customized commands!

# Command List
```
!help
    Display a list of available commands
!setuser <username>
    Set your lishogi username
!deleteuser
    Delete your lishogi username from the bot's database
!setgamemode [game mode]
    Set your favorite game (or puzzle) mode
!profile [username]
    Display your (or a user's) profile
!leaderboard [game mode]
    Display top-rated players
!playing [username]
    Share your (or a user's) current game
!arena [game mode] [status]
    Find a created, started, or finished arena
!blog
    Display recent blog entries
!bots
    Display online bots
!broadcast
    Find an upcoming or recent broadcast created by lishogi
!coach
    Find a coach
!fesa
    Display FESA news
!news
    Display recent news
!puzzle
    Display today's puzzle
!schedule <event> <sente> <gote> <year> <month> <day> <hour> <minute>
    Schedule event (tournament) game
!simul
    Display a recently finished, ongoing, or upcoming simultanous exhibition
!streamers
    Display live streamers
!team
    Search teams for a keyword
!timestamp <year> <month> <day> <hour> <minute>
    Print discord magic timestamp
!tv [game mode]
    Display TV game list
!video
    Search videos for a keyword
!privacy
    View privacy policy
!stop
    Stop the bot (owner only)
```
