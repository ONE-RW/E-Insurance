require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    app.listen(env.port, () => {
      console.log(`E-Assurance backend listening on port ${env.port}`);
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  }
}

start();
