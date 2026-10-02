const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Send feedback about the bot via a modal form.'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('feedback:modal')
            .setTitle('Send Feedback');

        const messageInput = new TextInputBuilder()
            .setCustomId('feedback:message')
            .setLabel('What would you like to tell us?')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(messageInput)
        );

        await interaction.showModal(modal);
    },
};
