// Runs the bot through the cluster manager for production deployments.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('../src/bot');
