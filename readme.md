# lichess discord bot
[![Discord Bots](https://discordbots.org/api/widget/status/842330057841049600.svg)](https://discordbots.org/bot/842330057841049600)
[![Build Status](https://github.com/ddugovic/lishogi-discord/workflows/Node.js%20CI/badge.svg)](https://github.com/ddugovic/lishogi-discord/actions?query=workflow%3A%22Node.js+CI%22)

# Setup

1. Edit `config.example.json` and rename it to `config.json`

2. Run `index.js`

# Features

1. Link your lichess username with this bot to get customized commands!

# Command List
```
!help
    Display a list of available commands
!setuser <username>
    Set your lichess username
!deleteuser
    Delete your lichess username from the bot's database
!setgamemode [game mode]
    Set your favorite game (or puzzle) mode
!profile [username]
    Display your (or a user's) profile
!jerome
    Display Jerome Gambit news
!leaderboard [game mode]
    Display top-rated players
!playing [username]
    Share your (or a user's) current game
!arena [game mode] [status]
    Find a created, started, or finished arena
!blog
    Display recent blog entries
!bots
    Display online bots with source code
!broadcast
    Display an incoming, ongoing, or finished official broadcast
!coach
    Find a coach
!community
    Display recent community blog entries
!eval [fen]
    Get the cached evaluation of a position, if available
!log
    Display recent changes
!news
    Display recent news
!puzzle
    Display today's puzzle
!reddit
    Fetch r/chess image
!simul [variant]
    Display a recently finished, ongoing, or upcoming simultanous exhibition
!streamers
    Display live streamers
!team
    Search teams for a keyword
!tv [channel]
    Share the featured game
!video
    Search videos for a keyword
!privacy
    View privacy policy
!stop
    Stop the bot (owner only)
```
