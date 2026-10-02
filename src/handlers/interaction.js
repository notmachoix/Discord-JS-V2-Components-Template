// ========================= COMPONENT INTERACTION HANDLER =========================
// Recursively loads button, select menu, and modal handlers into
// client.buttons / client.selectMenus / client.modals, keyed by customId.
//
// Each file should export: { customId: 'my_id', async execute(interaction, client) {...} }
//
// For dynamic customIds (e.g. "ticket_close_123"), set customId to the
// static prefix and add `startsWith: true` — interactionCreate.js will then
// match any customId that starts with that prefix.

const fs = require('fs');
const path = require('path');
const { colorize } = require('../utils/consoleStyle');

const TARGETS = [
    { dir: 'buttons', collection: 'buttons', label: 'BUTTONS' },
    { dir: 'selectMenus', collection: 'selectMenus', label: 'SELECT MENUS' },
    { dir: 'modals', collection: 'modals', label: 'MODALS' },
];

function loadRecursive(dir, onFile) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            loadRecursive(entryPath, onFile);
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.js')) {
            onFile(entryPath);
        }
    }
}

module.exports = (client) => {

    const interactionsRoot = path.join(process.cwd(), 'src/interactions');

    for (const target of TARGETS) {

        const loaded = [];
        const skipped = [];
        const rootDir = path.join(interactionsRoot, target.dir);

        loadRecursive(rootDir, (filePath) => {
            const relativePath = filePath.replace(process.cwd(), '.').replace(/\\/g, '/');

            try {
                delete require.cache[require.resolve(filePath)];
                const handler = require(filePath);

                if (!handler || !handler.customId || typeof handler.execute !== 'function') {
                    skipped.push(`${relativePath} (missing customId/execute)`);
                    return;
                }

                client[target.collection].set(handler.customId, handler);
                loaded.push(`${handler.customId} -> ${relativePath}`);
            } catch (error) {
                skipped.push(`${relativePath} (${error.message})`);
            }
        });

        if (loaded.length === 0 && skipped.length === 0) continue;

        console.log(colorize('blue', `[${target.label}] Loaded ${loaded.length}, skipped ${skipped.length}`));
        loaded.forEach(line => console.log(colorize('blue', `  • ${line}`)));
        skipped.forEach(line => console.log(colorize('yellow', `  • skipped: ${line}`)));
    }
};
