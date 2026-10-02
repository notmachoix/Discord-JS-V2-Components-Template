const {
    Events,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
} = require("discord.js");

const { Logs } = require("../../../config/channelconfig");

module.exports = {
    name: Events.GuildMemberRemove,

    async execute(member) {
        const logChannel = member.guild.channels.cache.get(Logs.MemberLeaveLog);
        if (!logChannel) return;

        const created = Math.floor(member.user.createdTimestamp / 1000);
        const joined = Math.floor((member.joinedTimestamp ?? Date.now()) / 1000);
        const left = Math.floor(Date.now() / 1000);

        // Exclude @everyone and sort by highest role
        const roles = member.roles.cache
            .filter(role => role.id !== member.guild.id)
            .sort((a, b) => b.position - a.position);

        // Display roles as plain text (no ping)
        const roleText = roles.size
            ? roles.map(role => `• @${role.name}`).join("\n")
            : "*No roles*";

        const container = new ContainerBuilder()
            .setAccentColor(0xED4245)

            // Header
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "# 📤 Member Left"
                )
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // Member Details
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 👤 Member Information",
                    `**Username:** ${member.user.tag}`,
                    `**Display Name:** ${member.displayName}`,
                    `**User ID:** \`${member.id}\``,
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // Roles
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 🎭 Roles",
                    roleText,
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // Timeline
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 📅 Timeline",
                    `**Account Created:** <t:${created}:F>`,
                    `**Joined Server:** <t:${joined}:F>`,
                    `**Left Server:** <t:${left}:F>`,
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // Footer
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `-# Event: Guild Member Leave • <t:${left}:R>`
                )
            );

        await logChannel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            allowedMentions: {
                parse: [],
                users: [],
                roles: [],
            },
        });
    },
};