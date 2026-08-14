// Standalone DB connectivity preflight, run before migrations in the Docker CMD.
// sequelize-cli's own error output has proven unhelpful in production (just "ERROR: "
// with no message) - this connects directly with mysql2 and prints exactly what config
// was resolved from env vars and exactly why the connection failed, so a crash-loop
// produces an actionable log instead of a blank one.
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('[preflight] Resolved DB config from environment:', {
    host: config.host || '(MISSING)',
    port: config.port || '(MISSING)',
    database: config.database || '(MISSING)',
    user: config.user || '(MISSING)',
    password: config.password ? '(set)' : '(MISSING)'
  });

  let connection;
  try {
    connection = await mysql.createConnection(config);
    await connection.ping();
    console.log('[preflight] Database connection succeeded.');
    process.exit(0);
  } catch (err) {
    console.error('[preflight] Database connection FAILED.');
    console.error('[preflight] message:', err.message);
    console.error('[preflight] code:', err.code);
    console.error('[preflight] errno:', err.errno);
    console.error('[preflight] sqlState:', err.sqlState);
    process.exit(1);
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}

main();
