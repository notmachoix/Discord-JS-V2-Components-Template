const { MessageFlags } = require('discord.js');

function findHandler(collection, customId) {
    const exact = collection.get(customId);
    if (exact) return exact;

    return collection.find(handler =>
        handler.startsWith && customId.startsWith(handler.customId)
    );
}

async function replyError(interaction) {
    const payload = {
        content: '⚠ Something went wrong while handling that interaction.',
        flags: MessageFlags.Ephemeral,
    };

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(payload);
        } else {
            await interaction.reply(payload);
        }
    } catch {
        // interaction may have expired — nothing more we can do
    }
}

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        try {

            // ========================= SLASH COMMANDS =========================

            if (interaction.isChatInputCommand()) {
                const command = client.slash.get(interaction.commandName);
                if (!command) return;

                return await command.execute(interaction, client);
            }

            // ========================= AUTOCOMPLETE =========================

            if (interaction.isAutocomplete()) {
                const command = client.slash.get(interaction.commandName);
                if (!command || typeof command.autocomplete !== 'function') return;

                return await command.autocomplete(interaction, client);
            }

            // ========================= BUTTONS =========================

            if (interaction.isButton()) {
                const handler = findHandler(client.buttons, interaction.customId);
                if (!handler) return;

                return await handler.execute(interaction, client);
            }

            // ========================= SELECT MENUS =========================

            if (interaction.isAnySelectMenu()) {
                const handler = findHandler(client.selectMenus, interaction.customId);
                if (!handler) return;

                return await handler.execute(interaction, client);
            }

            // ========================= MODALS =========================

            if (interaction.isModalSubmit()) {
                const handler = findHandler(client.modals, interaction.customId);
                if (!handler) return;

                return await handler.execute(interaction, client);
            }

        } catch (error) {
            console.error('[INTERACTION ERROR]', error);

            if (interaction.isRepliable()) {
                await replyError(interaction);
            }
        }
    },
};
