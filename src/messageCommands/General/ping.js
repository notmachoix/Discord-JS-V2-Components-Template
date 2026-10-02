module.exports = {
    name: 'ping',
    aliases: ['pong', 'latency'],
    description: 'Checks the bot\'s latency.',

    async run(client, message) {
        const sent = await message.reply('Pinging...');
        const roundtrip = sent.createdTimestamp - message.createdTimestamp;

        await sent.edit(`🏓 Pong! Roundtrip: \`${roundtrip}ms\` | WebSocket: \`${client.ws.ping}ms\``);
    },
};
