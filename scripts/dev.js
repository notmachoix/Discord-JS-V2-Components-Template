// Runs the bot directly in a single process (no clustering) for local dev.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('../src/index');
