// ========================= SLASH COMMAND HANDLER =========================
// Loads every command in src/slashCommands/<Category>/*.js, registers it
// in-memory on client.slash, and pushes the full set to Discord's API.

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { colorize } = require('../utils/consoleStyle');

module.exports = async (client) => {

    const slash = [];

    let loadedCommands = [];
    let skippedCommands = [];

    // ========================= LOAD COMMANDS =========================

    const commandsRoot = path.join(process.cwd(), 'src/slashCommands');

    if (!fs.existsSync(commandsRoot)) {
        console.log(colorize('yellow', '[WARN] src/slashCommands folder not found, skipping slash handler.'));
        return;
    }

    fs.readdirSync(commandsRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .forEach(dir => {

            const commands = fs
                .readdirSync(path.join(commandsRoot, dir.name))
                .filter(file => file.endsWith('.js'));

            for (const file of commands) {

                const filePath = path.join(commandsRoot, dir.name, file);
                const commandModule = require(filePath);

                // ========================= VALID COMMAND =========================

                if (
                    commandModule.data &&
                    commandModule.data instanceof SlashCommandBuilder &&
                    typeof commandModule.execute === 'function'
                ) {

                    slash.push(commandModule.data.toJSON());

                    client.slash.set(
                        commandModule.data.name,
                        commandModule
                    );

                    const relativePath = filePath
                        .replace(process.cwd(), '.')
                        .replace(/\\/g, '/');

                    loadedCommands.push(
                        `${commandModule.data.name} -> ${relativePath}`
                    );

                } else {

                    skippedCommands.push(
                        filePath
                            .replace(process.cwd(), '.')
                            .replace(/\\/g, '/')
                    );
                }
            }
        });

    // ========================= BUILD LOG BOX =========================

    const allCommands = [
        'LOADED COMMANDS:',
        ...loadedCommands.map(cmd => `  • ${cmd}`),

        skippedCommands.length > 0
            ? '\nSKIPPED COMMANDS:'
            : '',

        ...skippedCommands.map(file => `  • ${file}`)
    ].join('\n');

    const boxLength =
        Math.max(...allCommands.split('\n').map(line => line.length)) + 4;

    const top = `╔${'═'.repeat(boxLength)}╗`;
    const bottom = `╚${'═'.repeat(boxLength)}╝`;

    console.log(colorize('green', top));

    allCommands.split('\n').forEach(line => {

        console.log(
            colorize(
                'green',
                `║ ${line.padEnd(boxLength - 2)} ║`
            )
        );
    });

    console.log(colorize('green', bottom));

    // ========================= ENV CHECK =========================

    if (!process.env.TOKEN || !process.env.CLIENTID) {

        console.log(
            colorize(
                'red',
                'ERROR: TOKEN or CLIENTID missing in .env'
            )
        );

        return;
    }

    if (
        process.env.NODE_ENV !== 'production' &&
        !process.env.GUILDID
    ) {

        console.log(
            colorize(
                'yellow',
                'WARNING: GUILDID missing, using global commands instead.'
            )
        );
    }

    // ========================= SKIP DUPLICATE REGISTRATION ON EXTRA CLUSTERS =========================
    // When running under discord-hybrid-sharding, src/index.js is spawned once
    // per cluster. Only the first cluster needs to push commands to Discord's API.

    if (client.cluster && client.cluster.id !== 0) {
        console.log(colorize('cyan', `➜ Skipping command registration on cluster ${client.cluster.id} (already handled by cluster 0).`));
        return;
    }

    // ========================= REGISTER COMMANDS =========================

    const rest = new REST({ version: '10' })
        .setToken(process.env.TOKEN);

    try {

        const isDev = process.env.NODE_ENV !== 'production';

        const route =
            isDev && process.env.GUILDID
                ? Routes.applicationGuildCommands(
                    process.env.CLIENTID,
                    process.env.GUILDID
                )
                : Routes.applicationCommands(
                    process.env.CLIENTID
                );

        const uniqueSlash = new Map();

        for (const command of slash) {

            if (uniqueSlash.has(command.name)) {

                console.log(
                    colorize(
                        'red',
                        `[DUPLICATE COMMAND SKIPPED] /${command.name}`
                    )
                );

                continue;
            }

            uniqueSlash.set(command.name, command);
        }

        await rest.put(route, {
            body: [...uniqueSlash.values()]
        });

        console.log(
            colorize(
                'magenta',
                `✔ Registered ${uniqueSlash.size} slash command(s) successfully.`
            )
        );

        console.log(
            colorize(
                'cyan',
                `➜ Deployment: ${isDev && process.env.GUILDID
                    ? 'Development Guild'
                    : 'Global'
                }`
            )
        );

    } catch (err) {

        console.log(
            colorize(
                'red',
                `ERROR: Failed to register commands:\n${err}`
            )
        );
    }
};
