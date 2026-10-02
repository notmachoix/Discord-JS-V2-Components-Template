// ========================= EVENT HANDLER =========================

const fs = require('fs');
const path = require('path');
const { colorize } = require('../utils/consoleStyle');

module.exports = (client) => {

    client.setMaxListeners(100);

    let loadedEvents = [];
    let skippedEvents = [];

    // ========================= RECURSIVE LOADER =========================

    const loadEvents = (dir) => {

        const files = fs.readdirSync(dir);

        for (const file of files) {

            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            // ========================= IF DIRECTORY =========================

            if (stat.isDirectory()) {
                loadEvents(filePath);
                continue;
            }

            // ========================= ONLY .JS FILES =========================

            if (!file.endsWith('.js')) continue;

            const event = require(filePath);

            // ========================= INVALID EVENT =========================

            if (!event.name || !event.execute) {
                skippedEvents.push(filePath.replace(process.cwd(), '.'));
                continue;
            }

            // ========================= REGISTER EVENT =========================

            client.removeAllListeners(event.name);

            if (event.once) {
                client.once(event.name, (...args) =>
                    event.execute(...args, client)
                );
            } else {
                client.on(event.name, (...args) =>
                    event.execute(...args, client)
                );
            }

            // ========================= FORMAT DISPLAY PATH =========================

            const relativePath = filePath
                .replace(process.cwd(), '.')
                .replace(/\\/g, '/');

            loadedEvents.push(
                `${event.name}${event.once ? ' (once)' : ''} -> ${relativePath}`
            );
        }
    };

    // ========================= START LOADING =========================

    loadEvents(path.join(process.cwd(), 'src/events'));

    // ========================= BUILD LOG BOX =========================

    const allEvents = [
        'LOADED EVENTS:',
        ...loadedEvents.map(name => `  • ${name}`),

        skippedEvents.length > 0
            ? '\nSKIPPED EVENTS:'
            : '',

        ...skippedEvents.map(file => `  • ${file}`)
    ].join('\n');

    const boxLength =
        Math.max(...allEvents.split('\n').map(line => line.length)) + 4;

    const top = `╔${'═'.repeat(boxLength)}╗`;
    const bottom = `╚${'═'.repeat(boxLength)}╝`;

    console.log(colorize('cyan', top));

    allEvents.split('\n').forEach(line => {
        console.log(
            colorize(
                'cyan',
                `║ ${line.padEnd(boxLength - 2)} ║`
            )
        );
    });

    console.log(colorize('cyan', bottom));

    // ========================= FINAL LOG =========================

    console.log(
        colorize(
            'magenta',
            `✔ Loaded ${loadedEvents.length} event(s) successfully.`
        )
    );

    if (skippedEvents.length > 0) {
        console.log(
            colorize(
                'yellow',
                `⚠ Skipped ${skippedEvents.length} invalid event file(s).`
            )
        );
    }
};