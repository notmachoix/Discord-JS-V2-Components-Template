require('dotenv').config({ quiet: true });

require('./console/watermark');

const {
    Client,
    Partials,
    Collection
} = require('discord.js');

const {
    ClusterClient
} = require('discord-hybrid-sharding');

const {
    colorize
} = require('./utils/consoleStyle');

// ===========================================
// CREATE CLIENT
// ===========================================
const client = new Client({

    intents: [

        'Guilds',
        'GuildMembers',
        'GuildMessages',
        'GuildMessageReactions',
        'DirectMessages',
        'MessageContent',
        'GuildVoiceStates'

    ],

    partials: [

        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction

    ]

});

// ===========================================
// EXPORT CLIENT
// ===========================================
module.exports = client;

// ===========================================
// ENV CHECKS
// ===========================================
if (!process.env.TOKEN) {

    console.log(
        colorize(
            'yellow',
            '[WARN] Missing TOKEN in .env'
        )
    );

    process.exit();
}

if (!process.env.CLIENTID || !process.env.GUILDID) {

    console.log(
        colorize(
            'yellow',
            '[WARN] Missing CLIENTID or GUILDID in .env'
        )
    );
}

// ===========================================
// COLLECTIONS
// ===========================================
client.commands = new Collection();   // message commands, keyed by name
client.events = new Collection();
client.slash = new Collection();      // slash commands, keyed by name
client.aliases = new Collection();    // message command aliases -> name
client.buttons = new Collection();    // button handlers, keyed by customId
client.selectMenus = new Collection(); // select menu handlers, keyed by customId
client.modals = new Collection();     // modal handlers, keyed by customId

// ===========================================
// CLUSTER CLIENT
// ===========================================
client.cluster = new ClusterClient(client);

// ===========================================
// LOAD HANDLERS
// ===========================================
[
    'event',
    'interaction',
    'slash',
    'message'
].forEach(handler => {

    require(`./handlers/${handler}`)(client);

});

// ===========================================
// LOGIN
// ===========================================
client.login(process.env.TOKEN)

    .then(() => {

        console.log(
            colorize(
                'green',
                '[INFO] App logged in successfully'
            )
        );
    })

    .catch(err => {

        console.error(
            '[CRASH] Failed to login:',
            err
        );

        process.exit();
    });

// ===========================================
// ERROR HANDLING
// (the "ready" banner + presence are set in src/events/client/ready.js)
// ===========================================
client.on('error', error => {

    console.error(
        '[CLIENT ERROR]',
        error
    );
});

client.on('shardError', error => {

    console.error(
        '[SHARD ERROR]',
        error
    );
});

process.on('uncaughtException', err => {

    console.error(
        '[UNCAUGHT EXCEPTION]',
        err
    );
});

process.on(
    'unhandledRejection',

    (reason, promise) => {

        console.error(
            '[UNHANDLED REJECTION]',
            promise,
            reason
        );
    }
);