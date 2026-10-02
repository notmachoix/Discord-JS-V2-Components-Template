const roleConfig = require('../config/roleconfig');

/**
 * Returns true if the given GuildMember has a configured staff role.
 * @param {import('discord.js').GuildMember} member
 */
module.exports = (member) => {
    const staffRoles = [
        roleConfig.Staff.ModeratorRoleId,
    ].filter(Boolean);

    return member.roles.cache.some(role =>
        staffRoles.includes(role.id)
    );
};
