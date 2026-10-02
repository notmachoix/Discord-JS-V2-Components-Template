const config = require('../../config/config.json');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
    name: 'messageCreate',
    once: false,

    // NOTE: discord.js fires messageCreate with (message). The event handler
    // then appends the client, so the signature here is (message, client) —
    // not (client, message).
    async execute(message, client) {
        if (!message || !message.content) return;
        if (message.author?.bot) return;

        const prefix = typeof config.prefix === 'string' ? config.prefix.trim() : '';
        const botName = typeof config.botName === 'string' && config.botName.trim().length > 0
            ? config.botName.trim().toLowerCase()
            : '';

        const mentionRegex = client.user
            ? new RegExp(`^<@!?${escapeRegex(client.user.id)}>(?:\\s+|$)`)
            : null;

        let content = message.content.trim();
        let triggerMatched = false;

        // Commands can be triggered by prefix ("!ping"), by bot name
        // ("bot ping"), or by mentioning the bot ("@Bot ping").

        if (prefix && content.startsWith(prefix)) {
            triggerMatched = true;
            content = content.slice(prefix.length).trim();
        }

        if (!triggerMatched && botName) {
            const botNameRegex = new RegExp(`^${escapeRegex(botName)}(?:\\s+|$)`, 'i');
            const nameMatch = content.match(botNameRegex);

            if (nameMatch) {
                triggerMatched = true;
                content = content.slice(nameMatch[0].length).trim();
            }
        }

        if (!triggerMatched && mentionRegex) {
            const mentionMatch = content.match(mentionRegex);

            if (mentionMatch) {
                triggerMatched = true;
                content = content.slice(mentionMatch[0].length).trim();
            }
        }

        if (!triggerMatched) return;

        const args = content.split(/\s+/).filter(Boolean);
        if (args.length === 0) return;

        const input = args.shift().toLowerCase();

        const resolvedName = client.commands.has(input) ? input : client.aliases.get(input);
        if (!resolvedName) return;

        const command = client.commands.get(resolvedName);
        if (!command || typeof command.run !== 'function') return;

        try {
            await command.run(client, message, args, prefix);
        } catch (error) {
            console.error(`[MESSAGE COMMAND ERROR] ${resolvedName}:`, error);

            await message.reply('⚠ An unexpected error occurred while running that command.').catch(() => null);
        }
    },
};
