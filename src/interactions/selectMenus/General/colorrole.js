const { ColorRoles } = require('../../../config/roleconfig');

module.exports = {
    customId: 'colorrole:select',

    async execute(interaction) {
        const choice = interaction.values[0];
        const roleId = ColorRoles[choice];

        if (!roleId) {
            return interaction.update({
                content: `⚠ The **${choice}** role isn't configured yet. Add its role ID to \`ColorRoles\` in \`src/config/roleconfig.js\`.`,
                components: [],
            });
        }

        const role = interaction.guild?.roles.cache.get(roleId);

        if (!role) {
            return interaction.update({
                content: `⚠ Couldn't find that role in this server.`,
                components: [],
            });
        }

        try {
            await interaction.member.roles.add(role);
            await interaction.update({
                content: `✅ You've been given the **${role.name}** role!`,
                components: [],
            });
        } catch (error) {
            console.error('[COLOR ROLE ERROR]', error);
            await interaction.update({
                content: '⚠ I couldn\'t assign that role — check my permissions and role position.',
                components: [],
            });
        }
    },
};
