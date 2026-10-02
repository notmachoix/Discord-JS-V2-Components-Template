const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
} = require('discord.js');
const config = require('../../config/config.json');

const getColor = () => parseInt(String(config.color || '5865F2').replace('#', ''), 16);

// Exported so the button handler (src/interactions/buttons/General/pingRefresh.js)
// can rebuild the same message on refresh. Built entirely with Components V2 —
// note that V2 messages cannot also set `content`, so don't mix the two.
function buildPingPayload(client) {
    const container = new ContainerBuilder()
        .setAccentColor(getColor())

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('# 🏓 Pong!')
        )

        .addSeparatorComponents(new SeparatorBuilder())

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**WebSocket Ping:** ${client.ws.ping}ms`
            )
        )

        .addSeparatorComponents(new SeparatorBuilder())

        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ping:refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            )
        );

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [container],
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot\'s latency.'),

    buildPingPayload,

    async execute(interaction, client) {
        await interaction.reply(buildPingPayload(client));
    },
};
