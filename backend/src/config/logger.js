const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: env.nodeEnv === 'production'
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true } }
});

module.exports = logger;
