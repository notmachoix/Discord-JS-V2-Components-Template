# Discord Bot Template (Discord.js v14)

A functional, ready-to-run starting point for Discord bots built with **Discord.js v14**. It comes with working examples of every major building block so you can delete what you don't need and build on what you do.

## Features

- ✅ Slash commands (auto-registered on startup)
- ✅ Message ("prefix") commands, triggered by prefix, bot name, or mention
- ✅ Buttons, select menus, and modals — loaded automatically by customId
- ✅ Event handler that recursively loads every file in `src/events`
- ✅ Optional clustering via `discord-hybrid-sharding` for production
- ✅ Working example commands for every interaction type (see below)
- ✅ Config-driven channel/role IDs, bot color, prefix, and name

## Project structure

```
src/
  bot.js                 # Production entry point (spawns clusters)
  index.js               # Per-process bot client (also used directly in dev)
  config/
    config.json           # color, prefix, botName
    channelconfig.js       # named channel IDs (fill these in)
    roleconfig.js          # named role IDs (fill these in)
  console/watermark.js     # startup banner
  handlers/
    event.js               # loads src/events/** into the client
    slash.js                # loads src/slashCommands/** and registers them with Discord
    message.js              # loads src/messageCommands/**
    interaction.js           # loads src/interactions/{buttons,selectMenus,modals}/**
  events/
    client/                 # ready, messageCreate, interactionCreate, ...
    client/Guild/            # guildMemberAdd, guildMemberRemove
  slashCommands/<Category>/  # one file per slash command
  messageCommands/<Category>/# one file per prefix command
  interactions/
    buttons/<Category>/       # one file per button customId
    selectMenus/<Category>/   # one file per select menu customId
    modals/<Category>/        # one file per modal customId
  utils/                    # loadEnv, consoleStyle, isStaff
scripts/
  dev.js                   # runs src/index.js directly, no clustering
  prod.js                  # runs src/bot.js (clustered)
```

## Setup

1. Copy `.env.example` to `.env` and fill in your bot's `TOKEN`, `CLIENTID`, and (for instant command updates during development) a `GUILDID`.
2. `npm install`
3. `npm run dev` — starts the bot in a single process, registers slash commands to your dev guild, and reloads immediately.
4. Once you're happy, `npm run prod` (or `npm start`) runs the clustered production entry point.

## Adding a slash command

Create a new file under `src/slashCommands/<Category>/yourcommand.js`:

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello.'),

    async execute(interaction, client) {
        await interaction.reply('Hello!');
    },
};
```

It's picked up automatically on the next restart and registered with Discord.

## Adding a message ("prefix") command

Create a file under `src/messageCommands/<Category>/yourcommand.js`:

```js
module.exports = {
    name: 'hello',
    aliases: ['hi'],
    async run(client, message, args, prefix) {
        await message.reply('Hello!');
    },
};
```

Commands trigger on the configured `prefix` (`config.json`), the bot's name, or an @mention.

## Adding a button, select menu, or modal

Each handler file exports a `customId` and an `execute(interaction, client)` function, and is placed under the matching folder in `src/interactions/`:

```js
// src/interactions/buttons/General/example.js
module.exports = {
    customId: 'example:button',
    async execute(interaction, client) {
        await interaction.reply({ content: 'You clicked it!', ephemeral: true });
    },
};
```

For dynamic IDs (e.g. `close_ticket_482910`), set `startsWith: true` alongside a static `customId` prefix (e.g. `'close_ticket_'`) and the loader will match any customId starting with it.

## Included example commands

| Command | Type | Demonstrates |
|---|---|---|
| `/ping` | slash | embeds + a button (`ping:refresh`) |
| `/feedback` | slash | opens a modal, forwards the submission to a log channel |
| `/color-role` | slash | a select menu that assigns a role |
| `!ping` / `!pong` / `!latency` | message | prefix command with aliases |

Delete any of these once you no longer need them as reference.

## Configuration

- `src/config/config.json` — `color` (hex, no `#`), `prefix`, `botName`
- `src/config/channelconfig.js` — named channel IDs referenced across the bot (e.g. `Logs.MemberJoinLog`)
- `src/config/roleconfig.js` — named role IDs (e.g. `Staff.ModeratorRoleId`, `ColorRoles.*`)

## Clustering

`src/bot.js` uses [`discord-hybrid-sharding`](https://github.com/meister03/discord-hybrid-sharding) to spawn clustered instances of `src/index.js` for production. Slash command registration is skipped on every cluster except cluster `0` to avoid redundant Discord API calls. If you don't need clustering, just run `node src/index.js` (or `npm run dev`) directly — it works standalone.
