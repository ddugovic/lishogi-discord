# playstrategy discord bot
[![Discord Bots](https://discordbots.org/api/widget/status/842330057841049600.svg)](https://discordbots.org/bot/842330057841049600)
[![Build Status](https://github.com/ddugovic/lishogi-discord/workflows/Node.js%20CI/badge.svg)](https://github.com/ddugovic/lishogi-discord/actions?query=workflow%3A%22Node.js+CI%22)

# Setup

1. Edit `config.example.json` and rename it to `config.json`

2. Run `index.js`

# Features

1. Link your playstrategy username with this bot to get customized commands!

# Command List
```
!help
    Display a list of available commands
!setuser <username>
    Set your playstrategy username
!deleteuser
    Delete your playstrategy username from the bot's database
!setgamemode [game mode]
    Set your favorite game (or puzzle) mode
!profile [username]
    Display your (or a user's) profile
!leaderboard [game mode]
    Display top-rated players
!playing [username]
    Share your (or a user's) current game URL
!gif [username]
    Share your (or a user's) current game as a GIF
!arena [username]
    Find an upcoming or recent arena created by playstrategy (or a user)
!blog
    Display latest blog entry
!puzzle
    Display today's puzzle
!simul
    Display a recently finished, ongoing, or upcoming simultanous exhibition
!streamers
    Display live streamers
!team
    Search teams for a keyword
!tv [game mode]
    Share the featured game
!privacy
    View privacy policy
!stop
    Stop the bot (owner only)
```
