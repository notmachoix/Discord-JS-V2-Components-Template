// src/bot.js
// Cluster manager entry point — spawns one or more clustered instances of
// src/index.js using discord-hybrid-sharding. Run this directly (or via
// `npm run prod` / `npm start`) for production deployments.
//
// For local development without clustering, use `npm run dev` instead,
// which runs src/index.js directly in a single process.

require('./utils/loadEnv')();

process.on('uncaughtException', err => {
    console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', err => {
    console.error('[UNHANDLED REJECTION]', err);
});

const { ClusterManager } = require('discord-hybrid-sharding');
const path = require('path');

const productionMode = process.env.NODE_ENV === 'production';
const botMode = productionMode ? 'production' : 'development';

console.log(`[BOOT] Starting bot manager in ${botMode} mode...`);

const manager = new ClusterManager(
    path.join(__dirname, 'index.js'),
    {
        totalShards: 'auto',

        shardsPerClusters: productionMode ? 2 : 1,
        totalClusters: productionMode ? 'auto' : 1,

        mode: 'process',
        token: process.env.TOKEN,
    }
);

manager.on('clusterCreate', cluster => {
    console.log(`[CLUSTER] Cluster ${cluster.id} created in ${botMode} mode`);
});

manager.on('debug', message => {
    if (!productionMode) {
        console.log(`[SHARD DEBUG] ${message}`);
    }
});

manager.spawn({ timeout: -1 }).catch(err => {
    console.error('[MANAGER ERROR] Failed to spawn clusters:', err);
    process.exit(1);
});
