const {
    Events,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
} = require("discord.js");

const { Logs } = require("../../../config/channelconfig");

const AUTO_ROLES = [
    // "ROLE_ID_1",
    // "ROLE_ID_2",
];

const SEND_WELCOME_DM = true;

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        const logChannel = member.guild.channels.cache.get(Logs.MemberJoinLog);
        if (!logChannel) return;

        const created = Math.floor(member.user.createdTimestamp / 1000);
        const joined = Math.floor(Date.now() / 1000);

        /* ===========================
           Auto Roles
        =========================== */

        const assignedRoles = [];

        for (const roleId of AUTO_ROLES) {
            const role = member.guild.roles.cache.get(roleId);
            if (!role) continue;

            try {
                await member.roles.add(role);
                assignedRoles.push(`• @${role.name}`);
            } catch (err) {
                console.error(`Failed to add role ${role.id}:`, err);
            }
        }

        /* ===========================
           Welcome DM
        =========================== */

        let dmStatus = "❌ Failed (User has DMs disabled)";

        if (SEND_WELCOME_DM) {
            try {
                const dmContainer = new ContainerBuilder()
                    .setAccentColor(0x57F287)

                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `# 👋 Welcome to ${member.guild.name}`
                        )
                    )

                    .addSeparatorComponents(new SeparatorBuilder())

                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent([
                            `Hello **${member.user.username}**,`,
                            "",
                            "Welcome to the server! We're excited to have you here.",
                            "",
                            "### Before You Begin",
                            "• Read the server rules.",
                            "• Complete verification (if required).",
                            "• Introduce yourself to the community.",
                            "",
                            "Enjoy your stay! 🎉",
                        ].join("\n"))
                    )

                    .addSeparatorComponents(new SeparatorBuilder())

                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `-# This message was sent automatically by ${member.guild.name}.`
                        )
                    );

                await member.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [dmContainer],
                    allowedMentions: {
                        parse: [],
                    },
                });

                dmStatus = "✅ Successfully Delivered";
            } catch {
                dmStatus = "❌ Failed (User has DMs disabled)";
            }
        } else {
            dmStatus = "Disabled";
        }

        /* ===========================
           Join Log
        =========================== */

        const container = new ContainerBuilder()
            .setAccentColor(0x57F287)

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "# 📥 Member Joined"
                )
            )

            .addSeparatorComponents(new SeparatorBuilder())

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 👤 Member Information",
                    `**Username:** ${member.user.tag}`,
                    `**Display Name:** ${member.displayName}`,
                    `**User ID:** \`${member.id}\``,
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 📅 Account Information",
                    `**Account Created:** <t:${created}:F>`,
                    `**Account Age:** <t:${created}:R>`,
                    `**Joined Server:** <t:${joined}:F>`,
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 🎁 Automatic Roles",
                    assignedRoles.length
                        ? assignedRoles.join("\n")
                        : "*No automatic roles assigned.*",
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    "## 📨 Welcome Direct Message",
                    dmStatus,
                ].join("\n"))
            )

            .addSeparatorComponents(new SeparatorBuilder())

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `-# Event: Guild Member Join • <t:${joined}:R>`
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