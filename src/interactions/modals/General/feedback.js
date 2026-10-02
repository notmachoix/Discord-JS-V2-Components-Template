const { MessageFlags } = require('discord.js');
const { Logs } = require('../../../config/channelconfig');

module.exports = {
    customId: 'feedback:modal',

    async execute(interaction, client) {
        const message = interaction.fields.getTextInputValue('feedback:message');

        // Optionally forward feedback to a log channel — configure
        // Logs.ModerationLog (or add a dedicated channel) in channelconfig.js.
        const logChannel = interaction.guild?.channels.cache.get(Logs.ModerationLog);

        if (logChannel) {
            await logChannel.send({
                content: `📝 **Feedback from ${interaction.user.tag}** (\`${interaction.user.id}\`):\n${message}`,
                allowedMentions: { parse: [] },
            }).catch(() => null);
        }

        await interaction.reply({
            content: '✅ Thanks for your feedback!',
            flags: MessageFlags.Ephemeral,
        });
    },
};
