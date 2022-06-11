# chess.com discord bot
[![Discord Bots](https://discordbots.org/api/widget/status/842330057841049600.svg)](https://discordbots.org/bot/842330057841049600)
[![Build Status](https://github.com/ddugovic/lishogi-discord/workflows/Node.js%20CI/badge.svg)](https://github.com/ddugovic/lishogi-discord/actions?query=workflow%3A%22Node.js+CI%22)

# Setup

1. Edit `config.example.json` and rename it to `config.json`

2. Run `index.js`

# Features

1. Link your chess.com username with this bot to get customized commands!

# Command List
```
!help
    Sends a list of available commands
!setuser <username>
    Sets your chess.com username
!deleteuser
    Deletes your chess.com username from the bot's database
!setgamemode [game mode]
    Sets your favorite game (or puzzle) mode
!profile [username]
    Displays your (or a user's) profile
!recent [rated/casual]
    Shares your most recent game
!playing [username]
    Shares your (or a user's) current game URL
!playing [username]
    Shares your (or a user's) current game as a GIF
!arena [username]
    Find an upcoming or recent arena created by chess.com (or a user)
!broadcast
    Find an incoming, ongoing, or finished official broadcast
!puzzle
    Displays today's puzzle
!tv [game mode]
    Shares the featured game
!privacy
    View privacy policy
!stop
    Stops the bot (owner only)
```
