module.exports = {
    customId: 'ping:refresh',

    async execute(interaction, client) {
        const { buildPingPayload } = client.slash.get('ping');

        await interaction.update(buildPingPayload(client));
    },
};
