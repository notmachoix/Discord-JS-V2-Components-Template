const {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    MessageFlags,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color-role')
        .setDescription('Pick a color role from a dropdown menu.'),

    async execute(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('colorrole:select')
            .setPlaceholder('Choose a color role')
            .addOptions(
                { label: 'Red', value: 'Red', emoji: '🔴' },
                { label: 'Blue', value: 'Blue', emoji: '🔵' },
                { label: 'Green', value: 'Green', emoji: '🟢' },
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: 'Pick a color role below:',
            components: [row],
            flags: MessageFlags.Ephemeral,
        });
    },
};
